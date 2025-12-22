package com.waad.tba.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Method Security Configuration for SUPER_ADMIN bypass.
 * 
 * This configuration registers a custom PermissionEvaluator
 * that automatically grants SUPER_ADMIN full access to all protected endpoints.
 * 
 * CRITICAL BUSINESS RULE:
 * SUPER_ADMIN must NEVER be blocked by any @PreAuthorize annotation.
 * 
 * NOTE: The actual bypass for hasAuthority()/hasRole() is implemented in
 * CustomUserDetailsService by granting SUPER_ADMIN ALL permissions at login time.
 * This config only handles hasPermission() expressions.
 * 
 * @author TBA WAAD System
 * @version 1.0
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class MethodSecurityConfig {

    private final SuperAdminPermissionEvaluator permissionEvaluator;

    /**
     * Register the custom expression handler that grants SUPER_ADMIN bypass
     * for hasPermission() expressions.
     */
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
        log.info("🔐 Registering SUPER_ADMIN bypass security expression handler");
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
        handler.setPermissionEvaluator(permissionEvaluator);
        return handler;
    }
}
