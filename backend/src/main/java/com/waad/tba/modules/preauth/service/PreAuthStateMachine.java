package com.waad.tba.modules.preauth.service;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.waad.tba.common.exception.BusinessRuleException;
import com.waad.tba.common.exception.ClaimStateTransitionException;
import com.waad.tba.modules.preauth.entity.PreAuthStatus;
import com.waad.tba.modules.preauth.entity.PreAuthorization;
import com.waad.tba.modules.rbac.entity.Role;
import com.waad.tba.modules.rbac.entity.User;

import lombok.extern.slf4j.Slf4j;

/**
 * Pre-Authorization State Machine - Enforces workflow with role-based permissions.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * WORKFLOW: REQUESTED → UNDER_REVIEW → APPROVED / REJECTED
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * BUSINESS RULES:
 * 1. REJECTION requires rejection reason
 * 2. APPROVAL requires approved amount and validity period
 * 3. EXPIRED cannot be manually set - only by system job
 * 4. Terminal states (REJECTED, EXPIRED) cannot be changed
 * 
 * SMOKE TEST:
 * Scenario: Happy Path
 *   Given: PreAuth PA001 in REQUESTED
 *   When: INSURANCE takes for review → reviews → approves
 *   Then: REQUESTED → UNDER_REVIEW → APPROVED
 */
@Slf4j
@Service
public class PreAuthStateMachine {

    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final String ROLE_INSURANCE = "INSURANCE_ADMIN";
    private static final String ROLE_EMPLOYER = "EMPLOYER_ADMIN";
    private static final String ROLE_REVIEWER = "REVIEWER";

    /**
     * Validate and perform state transition.
     */
    public void transition(PreAuthorization preAuth, PreAuthStatus targetStatus, User currentUser) {
        PreAuthStatus currentStatus = preAuth.getStatus();
        
        log.info("🔄 PreAuth transition request: {} → {} by user {}", 
            currentStatus, targetStatus, currentUser.getUsername());
        
        // Rule 1: Validate transition path
        validateTransitionPath(currentStatus, targetStatus);
        
        // Rule 2: Validate role permission
        validateRolePermission(currentStatus, targetStatus, currentUser);
        
        // Rule 3: Validate business requirements
        validateTransitionRequirements(preAuth, targetStatus);
        
        // Perform transition
        preAuth.setStatus(targetStatus);
        
        // Set reviewer info for reviewer actions
        if (targetStatus.requiresReviewerAction()) {
            preAuth.setReviewer(currentUser);
            preAuth.setReviewedAt(LocalDateTime.now());
        }
        
        log.info("✅ PreAuth {} transitioned: {} → {}", preAuth.getPreAuthNumber(), currentStatus, targetStatus);
    }

    private void validateTransitionPath(PreAuthStatus from, PreAuthStatus to) {
        if (from == to) {
            return; // No-op
        }
        
        if (from.isTerminal()) {
            throw new ClaimStateTransitionException(
                from.name(), to.name(),
                "Cannot transition from terminal state " + from.name()
            );
        }
        
        if (!from.canTransitionTo(to)) {
            throw new ClaimStateTransitionException(from.name(), to.name());
        }
    }

    private void validateRolePermission(PreAuthStatus from, PreAuthStatus to, User user) {
        Set<String> requiredRoles = getRequiredRoles(from, to);
        Set<String> userRoles = getUserRoleNames(user);
        
        // SUPER_ADMIN can do anything
        if (userRoles.contains(ROLE_SUPER_ADMIN)) {
            return;
        }
        
        boolean hasPermission = requiredRoles.stream().anyMatch(userRoles::contains);
        
        if (!hasPermission) {
            String rolesStr = String.join(" or ", requiredRoles);
            throw new ClaimStateTransitionException(from.name(), to.name(), rolesStr);
        }
    }

    private Set<String> getRequiredRoles(PreAuthStatus from, PreAuthStatus to) {
        return switch (from) {
            case REQUESTED -> switch (to) {
                case UNDER_REVIEW -> Set.of(ROLE_INSURANCE, ROLE_REVIEWER);
                default -> Set.of();
            };
            case UNDER_REVIEW -> switch (to) {
                case APPROVED, REJECTED -> Set.of(ROLE_INSURANCE, ROLE_REVIEWER);
                case MORE_INFO_REQUIRED -> Set.of(ROLE_REVIEWER);
                default -> Set.of();
            };
            case MORE_INFO_REQUIRED -> switch (to) {
                case REQUESTED -> Set.of(ROLE_EMPLOYER, ROLE_INSURANCE); // Resubmit
                default -> Set.of();
            };
            case APPROVED -> switch (to) {
                case EXPIRED -> Set.of(); // System only
                default -> Set.of();
            };
            default -> Set.of();
        };
    }

    private void validateTransitionRequirements(PreAuthorization preAuth, PreAuthStatus targetStatus) {
        switch (targetStatus) {
            case REJECTED -> {
                if (preAuth.getRejectionReason() == null || preAuth.getRejectionReason().isBlank()) {
                    throw new BusinessRuleException(
                        "Cannot reject pre-authorization without rejection reason"
                    );
                }
            }
            case APPROVED -> {
                if (preAuth.getApprovedAmount() == null || 
                    preAuth.getApprovedAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                    throw new BusinessRuleException(
                        "Cannot approve pre-authorization without approved amount"
                    );
                }
                if (preAuth.getApprovalExpiryDate() == null) {
                    throw new BusinessRuleException(
                        "Cannot approve pre-authorization without expiry date"
                    );
                }
            }
            case EXPIRED -> {
                // Only system can expire - check that current status is APPROVED
                if (preAuth.getStatus() != PreAuthStatus.APPROVED) {
                    throw new BusinessRuleException(
                        "Only APPROVED pre-authorizations can expire"
                    );
                }
            }
            default -> { /* No additional requirements */ }
        }
    }

    private Set<String> getUserRoleNames(User user) {
        if (user == null || user.getRoles() == null) {
            return Set.of();
        }
        return user.getRoles().stream()
            .map(Role::getName)
            .collect(java.util.stream.Collectors.toSet());
    }

    /**
     * Get available transitions for UI display.
     */
    public Set<PreAuthStatus> getAvailableTransitions(PreAuthorization preAuth, User user) {
        PreAuthStatus current = preAuth.getStatus();
        Set<PreAuthStatus> validTransitions = current.getValidTransitions();
        Set<String> userRoles = getUserRoleNames(user);
        
        return validTransitions.stream()
            .filter(target -> {
                // Exclude EXPIRED from manual transitions
                if (target == PreAuthStatus.EXPIRED) return false;
                
                Set<String> required = getRequiredRoles(current, target);
                return userRoles.contains(ROLE_SUPER_ADMIN) ||
                       required.stream().anyMatch(userRoles::contains);
            })
            .collect(java.util.stream.Collectors.toSet());
    }
}
