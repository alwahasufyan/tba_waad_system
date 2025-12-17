package com.waad.tba.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.modules.rbac.entity.Permission;
import com.waad.tba.modules.rbac.entity.Role;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.rbac.repository.PermissionRepository;
import com.waad.tba.modules.rbac.repository.RoleRepository;
import com.waad.tba.modules.rbac.repository.UserRepository;
import com.waad.tba.security.AppPermission;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * RBAC Data Initializer - Clean Foundation (Version 2.0)
 * 
 * Initializes the complete RBAC system with:
 * - All permissions from AppPermission enum (27 permissions)
 * - 6 business-aligned roles:
 *   1. SUPER_ADMIN: Full system access
 *   2. INSURANCE_ADMIN: Insurance company administrator
 *   3. EMPLOYER_ADMIN: Employer company administrator
 *   4. REVIEWER: Medical claim reviewer
 *   5. PROVIDER: Healthcare provider
 *   6. USER: Basic read-only user
 * - Single superadmin user (superadmin@tba.sa / Admin@123)
 * 
 * @author TBA WAAD System
 * @version 2.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RbacDataInitializer implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║  RBAC Data Initializer - Clean Foundation v2.0             ║");
        log.info("╚════════════════════════════════════════════════════════════╝");
        
        try {
            // Step 1: Create all permissions from enum
            Map<String, Permission> permissionMap = ensureAllPermissions();
            log.info("✅ Step 1/3: Permissions initialized ({} total)", permissionMap.size());
            
            // Step 2: Create all roles with their permission mappings
            Map<String, Role> roleMap = ensureAllRoles(permissionMap);
            log.info("✅ Step 2/3: Roles initialized ({} total)", roleMap.size());
            
            // Step 3: Create superadmin user
            ensureSuperAdminUser(roleMap);
            log.info("✅ Step 3/3: Super Admin user initialized");
            
            log.info("╔════════════════════════════════════════════════════════════╗");
            log.info("║  RBAC Initialization Completed Successfully!               ║");
            log.info("║                                                            ║");
            log.info("║  Login Credentials:                                        ║");
            log.info("║  Username: superadmin                                      ║");
            log.info("║  Email:    superadmin@tba.sa                               ║");
            log.info("║  Password: Admin@123                                       ║");
            log.info("╚════════════════════════════════════════════════════════════╝");
            
        } catch (Exception e) {
            log.error("❌ RBAC initialization failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize RBAC system", e);
        }
    }

    /**
     * Step 1: Create all permissions from AppPermission enum.
     * Returns a map of permission name -> Permission entity for role assignment.
     * 100% Idempotent - checks existence before insert.
     */
    private Map<String, Permission> ensureAllPermissions() {
        log.info("📋 Initializing permissions from AppPermission enum...");
        
        Map<String, Permission> permissionMap = new HashMap<>();
        int created = 0;
        int skipped = 0;
        
        for (AppPermission appPerm : AppPermission.values()) {
            String permName = appPerm.getPermissionName();
            
            // Check if permission already exists
            Optional<Permission> existingPerm = permissionRepository.findByName(permName);
            
            if (existingPerm.isPresent()) {
                permissionMap.put(permName, existingPerm.get());
                skipped++;
                log.debug("   ⏭️  Skipping existing permission: {}", permName);
            } else {
                Permission newPerm = Permission.builder()
                        .name(permName)
                        .description(appPerm.getDescription() + " | " + appPerm.getDisplayNameAr())
                        .build();
                
                Permission saved = permissionRepository.save(newPerm);
                permissionMap.put(permName, saved);
                created++;
                log.debug("   ➕ Created permission: {}", permName);
            }
        }
        
        log.info("   📊 Permissions: {} created, {} skipped, {} total", created, skipped, permissionMap.size());
        return permissionMap;
    }

    /**
     * Step 2: Create all 6 business-aligned roles with their permission mappings.
     */
    private Map<String, Role> ensureAllRoles(Map<String, Permission> permissionMap) {
        log.info("👥 Initializing roles...");
        
        Map<String, Role> roleMap = new HashMap<>();
        
        // Role 1: SUPER_ADMIN - Full system access
        roleMap.put("SUPER_ADMIN", ensureRole(
                "SUPER_ADMIN",
                "المدير العام للنظام",
                "Full system administrator with all permissions",
                permissionMap,
                Arrays.asList(
                    // All permissions
                    "MANAGE_RBAC", "MANAGE_SYSTEM_SETTINGS",
                    "MANAGE_COMPANIES", "VIEW_COMPANIES",
                    "MANAGE_INSURANCE", "VIEW_INSURANCE",
                    "MANAGE_REVIEWER", "VIEW_REVIEWER",
                    "MANAGE_PROVIDERS", "VIEW_PROVIDERS",
                    "MANAGE_EMPLOYERS", "VIEW_EMPLOYERS",
                    "MANAGE_MEMBERS", "VIEW_MEMBERS",
                    "MANAGE_CLAIMS", "VIEW_CLAIMS", "CREATE_CLAIM", "UPDATE_CLAIM", 
                    "APPROVE_CLAIMS", "REJECT_CLAIMS", "VIEW_CLAIM_STATUS",
                    "MANAGE_VISITS", "VIEW_VISITS",
                    "MANAGE_PREAUTH", "VIEW_PREAUTH",
                    "MANAGE_REPORTS", "VIEW_REPORTS",
                    "VIEW_BASIC_DATA"
                )
        ));
        
        // Role 2: INSURANCE_ADMIN - Insurance company administrator
        roleMap.put("INSURANCE_ADMIN", ensureRole(
                "INSURANCE_ADMIN",
                "مدير شركة التأمين",
                "Insurance company administrator",
                permissionMap,
                Arrays.asList(
                    "MANAGE_MEMBERS", "VIEW_MEMBERS",
                    "MANAGE_CLAIMS", "VIEW_CLAIMS", "APPROVE_CLAIMS", "REJECT_CLAIMS",
                    "MANAGE_VISITS", "VIEW_VISITS",
                    "VIEW_REPORTS"
                )
        ));
        
        // Role 3: EMPLOYER_ADMIN - Employer company administrator
        roleMap.put("EMPLOYER_ADMIN", ensureRole(
                "EMPLOYER_ADMIN",
                "مدير صاحب العمل",
                "Employer company administrator",
                permissionMap,
                Arrays.asList(
                    "VIEW_MEMBERS",  // View only (MANAGE_MEMBERS is optional feature flag)
                    "VIEW_CLAIMS",
                    "VIEW_VISITS",
                    "VIEW_REPORTS"
                )
        ));
        
        // Role 4: REVIEWER - Medical claim reviewer
        roleMap.put("REVIEWER", ensureRole(
                "REVIEWER",
                "مراجع طبي",
                "Medical claim reviewer",
                permissionMap,
                Arrays.asList(
                    "VIEW_CLAIMS",
                    "APPROVE_CLAIMS",
                    "REJECT_CLAIMS"
                )
        ));
        
        // Role 5: PROVIDER - Healthcare provider
        roleMap.put("PROVIDER", ensureRole(
                "PROVIDER",
                "مقدم خدمة طبية",
                "Healthcare provider",
                permissionMap,
                Arrays.asList(
                    "CREATE_CLAIM",
                    "UPDATE_CLAIM",
                    "VIEW_CLAIM_STATUS"
                )
        ));
        
        // Role 6: USER - Basic read-only user
        roleMap.put("USER", ensureRole(
                "USER",
                "مستخدم عادي",
                "Basic read-only user",
                permissionMap,
                Arrays.asList(
                    "VIEW_BASIC_DATA"
                )
        ));
        
        log.info("   📊 Roles: {} total configured", roleMap.size());
        return roleMap;
    }

    /**
     * Helper method to create a role with specified permissions.
     * 100% Idempotent - skips if role already exists, no updates on existing roles.
     */
    private Role ensureRole(String roleName, String displayNameAr, String description, 
                           Map<String, Permission> permissionMap, List<String> permissionNames) {
        
        // Check if role already exists
        Optional<Role> existingRole = roleRepository.findByName(roleName);
        
        if (existingRole.isPresent()) {
            // Role exists - SKIP creation and permission mapping
            log.debug("   ⏭️  Skipping existing role: {}", roleName);
            return existingRole.get();
        }
        
        // Role doesn't exist - create it with permissions
        Set<Permission> permissions = permissionNames.stream()
                .map(permissionMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        Role newRole = Role.builder()
                .name(roleName)
                .description(description + " | " + displayNameAr)
                .permissions(permissions)
                .build();
        
        Role saved = roleRepository.save(newRole);
        log.debug("   ➕ Created role: {} ({} permissions)", roleName, permissions.size());
        return saved;
    }

    /**
     * Step 3: Create single superadmin user if not exists.
     * 100% Idempotent - checks existence before insert.
     */
    private void ensureSuperAdminUser(Map<String, Role> roleMap) {
        log.info("👤 Initializing super admin user...");
        
        String username = "superadmin";
        String email = "superadmin@tba.sa";
        String password = "Admin@123";
        
        // Check if superadmin user already exists
        Optional<User> existingUser = userRepository.findByUsername(username);
        
        if (existingUser.isPresent()) {
            log.info("   ⏭️  Skipping existing user: {}", username);
            return;
        }
        
        // Get SUPER_ADMIN role
        Role superAdminRole = roleMap.get("SUPER_ADMIN");
        if (superAdminRole == null) {
            throw new IllegalStateException("SUPER_ADMIN role not found!");
        }
        
        // Create superadmin user with SUPER_ADMIN role
        User superAdmin = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName("System Super Administrator")
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(superAdminRole)))
                .build();
        
        userRepository.save(superAdmin);
        log.info("   ✅ Created user: {}", username);
    }
}
