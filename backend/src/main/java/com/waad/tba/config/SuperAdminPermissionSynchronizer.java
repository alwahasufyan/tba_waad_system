package com.waad.tba.config;

import com.waad.tba.modules.rbac.entity.Permission;
import com.waad.tba.modules.rbac.entity.Role;
import com.waad.tba.modules.rbac.repository.PermissionRepository;
import com.waad.tba.modules.rbac.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * SUPER_ADMIN Permission Synchronizer
 * 
 * This component runs at application startup to ensure that the SUPER_ADMIN role
 * has ALL permissions in the system. This guarantees that:
 * 
 * 1. SUPER_ADMIN always has every permission, even newly added ones
 * 2. No manual database updates are needed when new permissions are added
 * 3. The sync is idempotent - safe to run multiple times
 * 4. Missing permissions used in @PreAuthorize annotations are auto-created
 * 
 * CRITICAL BUSINESS RULE:
 * SUPER_ADMIN must NEVER be blocked by missing permissions in the database.
 * 
 * How it works:
 * 1. Runs after RbacDataInitializer (Order = 100)
 * 2. Creates any missing permissions that are used in the codebase
 * 3. Fetches all permissions from the database
 * 4. Fetches SUPER_ADMIN role
 * 5. Adds any missing permissions to SUPER_ADMIN
 * 6. Logs the result
 * 
 * @author TBA WAAD System
 * @version 1.1
 */
@Component
@Order(100) // Run after RbacDataInitializer
@RequiredArgsConstructor
@Slf4j
public class SuperAdminPermissionSynchronizer {

    private static final String SUPER_ADMIN_ROLE_NAME = "SUPER_ADMIN";

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    /**
     * List of all permission names used in @PreAuthorize annotations.
     * These MUST exist in the database for hasAuthority() to work.
     */
    private static final List<String> REQUIRED_PERMISSIONS = Arrays.asList(
        // System permissions
        "MANAGE_SYSTEM_SETTINGS",
        
        // RBAC permissions (lowercase with dots - legacy format)
        "users.view", "users.manage", "users.assign_roles",
        "roles.view", "roles.manage", "roles.assign_permissions",
        "permissions.view", "permissions.manage",
        
        // Provider permissions
        "MANAGE_PROVIDERS", "VIEW_PROVIDERS",
        
        // Insurance permissions
        "MANAGE_INSURANCE", "VIEW_INSURANCE",
        
        // Employer permissions
        "MANAGE_EMPLOYERS", "VIEW_EMPLOYERS",
        
        // Member permissions
        "MANAGE_MEMBERS", "VIEW_MEMBERS",
        
        // Claims permissions  
        "MANAGE_CLAIMS", "VIEW_CLAIMS", "CREATE_CLAIM", "UPDATE_CLAIM",
        "APPROVE_CLAIMS", "REJECT_CLAIMS", "VIEW_CLAIM_STATUS",
        
        // Visit permissions
        "MANAGE_VISITS", "VIEW_VISITS",
        
        // Pre-auth permissions
        "MANAGE_PREAUTH", "VIEW_PREAUTH",
        "CREATE_PRE_APPROVAL", "VIEW_PRE_APPROVAL", "APPROVE_PRE_APPROVAL",
        "PROVIDER_STAFF", "TPA_STAFF", "MEDICAL_REVIEWER", "TPA_MANAGER",
        
        // Medical categories/services permissions
        "VIEW_MEDICAL_CATEGORIES", "MANAGE_MEDICAL_CATEGORIES",
        "VIEW_MEDICAL_SERVICES", "MANAGE_MEDICAL_SERVICES",
        
        // Medical packages permissions
        "MEDICAL_PACKAGE_READ", "MEDICAL_PACKAGE_CREATE",
        "MEDICAL_PACKAGE_UPDATE", "MEDICAL_PACKAGE_DELETE",
        
        // Reports permissions
        "VIEW_REPORTS", "MANAGE_REPORTS",
        
        // Company permissions
        "MANAGE_COMPANIES", "VIEW_COMPANIES",
        
        // Reviewer permissions
        "MANAGE_REVIEWER", "VIEW_REVIEWER",
        
        // Policy permissions
        "VIEW_POLICIES", "MANAGE_POLICIES",
        "VIEW_BENEFIT_PACKAGES", "MANAGE_BENEFIT_PACKAGES",
        
        // Basic access
        "VIEW_BASIC_DATA",
        
        // RBAC management
        "MANAGE_RBAC"
    );

    @PostConstruct
    @Transactional
    public void syncSuperAdminPermissions() {
        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║  SUPER_ADMIN Permission Synchronizer v1.1                  ║");
        log.info("╚════════════════════════════════════════════════════════════╝");

        try {
            // Step 1: Ensure all required permissions exist
            int permissionsCreated = ensureRequiredPermissions();
            if (permissionsCreated > 0) {
                log.info("📋 Created {} missing permissions in database", permissionsCreated);
            }
            
            // Step 2: Get SUPER_ADMIN role
            Optional<Role> superAdminOpt = roleRepository.findByName(SUPER_ADMIN_ROLE_NAME);
            
            if (superAdminOpt.isEmpty()) {
                log.warn("⚠️ SUPER_ADMIN role not found! Skipping permission sync.");
                log.warn("   Please ensure RbacDataInitializer runs first.");
                return;
            }

            Role superAdmin = superAdminOpt.get();
            
            // Step 3: Get all permissions
            List<Permission> allPermissions = permissionRepository.findAll();
            
            if (allPermissions.isEmpty()) {
                log.warn("⚠️ No permissions found in database! Skipping permission sync.");
                return;
            }

            // Step 4: Get current SUPER_ADMIN permissions
            Set<Permission> currentPermissions = superAdmin.getPermissions();
            if (currentPermissions == null) {
                currentPermissions = new HashSet<>();
            }

            // Step 5: Find missing permissions
            Set<Permission> missingPermissions = new HashSet<>();
            for (Permission permission : allPermissions) {
                boolean hasPermission = currentPermissions.stream()
                        .anyMatch(p -> p.getId().equals(permission.getId()));
                if (!hasPermission) {
                    missingPermissions.add(permission);
                }
            }

            // Step 6: Add missing permissions if any
            if (!missingPermissions.isEmpty()) {
                log.info("📋 Adding {} missing permissions to SUPER_ADMIN role...", missingPermissions.size());
                
                for (Permission permission : missingPermissions) {
                    log.debug("   ➕ Adding permission: {}", permission.getName());
                }
                
                // Add missing permissions
                currentPermissions.addAll(missingPermissions);
                superAdmin.setPermissions(currentPermissions);
                roleRepository.save(superAdmin);
                
                log.info("✅ Successfully added {} permissions to SUPER_ADMIN", missingPermissions.size());
            }

            // Step 7: Log final status
            int totalPermissions = allPermissions.size();
            int superAdminPermissions = superAdmin.getPermissions().size();
            
            log.info("╔════════════════════════════════════════════════════════════╗");
            log.info("║  SUPER_ADMIN permissions verified: {} / {} assigned         ", 
                    String.format("%3d", superAdminPermissions), 
                    String.format("%3d", totalPermissions));
            log.info("║                                                            ║");
            if (superAdminPermissions == totalPermissions) {
                log.info("║  ✅ SUPER_ADMIN has ALL permissions - Full system access   ║");
            } else {
                log.warn("║  ⚠️ SUPER_ADMIN missing some permissions!                  ║");
            }
            log.info("╚════════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            log.error("❌ Failed to sync SUPER_ADMIN permissions: {}", e.getMessage(), e);
            // Don't throw - allow application to start even if sync fails
            // The code-level bypass will still work
        }
    }
    
    /**
     * Ensure all required permissions exist in the database.
     * Creates any missing permissions.
     * 
     * @return Number of permissions created
     */
    private int ensureRequiredPermissions() {
        int created = 0;
        
        for (String permissionName : REQUIRED_PERMISSIONS) {
            Optional<Permission> existing = permissionRepository.findByName(permissionName);
            
            if (existing.isEmpty()) {
                Permission newPermission = Permission.builder()
                        .name(permissionName)
                        .description("Auto-created permission for " + permissionName)
                        .build();
                permissionRepository.save(newPermission);
                created++;
                log.debug("   ➕ Created permission: {}", permissionName);
            }
        }
        
        return created;
    }
}
