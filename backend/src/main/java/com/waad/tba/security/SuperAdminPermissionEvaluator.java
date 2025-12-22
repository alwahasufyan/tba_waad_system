package com.waad.tba.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Collection;

/**
 * Custom Permission Evaluator that grants SUPER_ADMIN unrestricted access.
 * 
 * This evaluator is used by Spring Security's @PreAuthorize annotations
 * when evaluating hasPermission() expressions.
 * 
 * CRITICAL BUSINESS RULE:
 * SUPER_ADMIN must NEVER be blocked by any permission check.
 * 
 * @author TBA WAAD System
 * @version 1.0
 */
@Component
@Slf4j
public class SuperAdminPermissionEvaluator implements PermissionEvaluator {

    private static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null) {
            return false;
        }
        
        // SUPER_ADMIN bypass - always grant access
        if (isSuperAdmin(authentication)) {
            log.debug("🔓 SUPER_ADMIN access granted (bypass mode) for permission: {}", permission);
            return true;
        }
        
        // Standard permission check
        String permissionString = permission.toString();
        return hasAuthority(authentication, permissionString);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (authentication == null) {
            return false;
        }
        
        // SUPER_ADMIN bypass - always grant access
        if (isSuperAdmin(authentication)) {
            log.debug("🔓 SUPER_ADMIN access granted (bypass mode) for permission: {} on {}", permission, targetType);
            return true;
        }
        
        // Standard permission check
        String permissionString = permission.toString();
        return hasAuthority(authentication, permissionString);
    }

    /**
     * Check if the authenticated user has SUPER_ADMIN role.
     */
    private boolean isSuperAdmin(Authentication authentication) {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> ROLE_SUPER_ADMIN.equals(auth.getAuthority()));
    }

    /**
     * Check if the authenticated user has a specific authority.
     */
    private boolean hasAuthority(Authentication authentication, String authority) {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> authority.equals(auth.getAuthority()));
    }
}
