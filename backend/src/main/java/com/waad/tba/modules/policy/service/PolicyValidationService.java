package com.waad.tba.modules.policy.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.waad.tba.common.exception.PolicyNotActiveException;
import com.waad.tba.common.exception.BusinessRuleException;
import com.waad.tba.common.error.ErrorCode;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.policy.entity.Policy;
import com.waad.tba.modules.policy.entity.Policy.PolicyStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Policy Validation Service - Validates policy eligibility for claims and visits.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * VALIDATION RULES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. POLICY STATUS must be ACTIVE
 *    - PENDING, SUSPENDED, EXPIRED, CANCELLED are not eligible
 * 
 * 2. DATE RANGE VALIDATION
 *    - Service date must be >= policy.startDate
 *    - Service date must be <= policy.endDate
 * 
 * 3. BENEFIT PACKAGE LINKAGE
 *    - Policy must have a linked BenefitPackage
 *    - BenefitPackage must be active
 * 
 * 4. MEMBER POLICY LINKAGE
 *    - Member must have a policy assigned
 *    - Member status must be ACTIVE
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMOKE TEST SCENARIOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Scenario 1: Active Policy - Happy Path
 *   Given: Policy P001 active from 2024-01-01 to 2024-12-31, status=ACTIVE
 *   When: validatePolicyForDate(P001, 2024-06-15)
 *   Then: No exception thrown
 * 
 * Scenario 2: Expired Policy
 *   Given: Policy P001 active from 2024-01-01 to 2024-12-31
 *   When: validatePolicyForDate(P001, 2025-01-15)
 *   Then: PolicyNotActiveException("Policy P001 is not active on 2025-01-15")
 * 
 * Scenario 3: Suspended Policy
 *   Given: Policy P002 status=SUSPENDED
 *   When: validatePolicyForDate(P002, 2024-06-15)
 *   Then: PolicyNotActiveException("Policy P002 is suspended")
 * 
 * Scenario 4: Policy Before Start Date
 *   Given: Policy P003 starts 2024-06-01
 *   When: validatePolicyForDate(P003, 2024-05-15)
 *   Then: PolicyNotActiveException("Policy P003 has not started yet")
 * 
 * Scenario 5: Member Without Policy
 *   Given: Member M001 with policy=null
 *   When: validateMemberPolicy(M001, 2024-06-15)
 *   Then: BusinessRuleException("Member has no active policy")
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyValidationService {

    /**
     * Validate that a policy is active for a given service date.
     * 
     * @param policy The policy to validate
     * @param serviceDate The date of service (visit/claim date)
     * @throws PolicyNotActiveException if policy is not valid for the date
     */
    public void validatePolicyForDate(Policy policy, LocalDate serviceDate) {
        if (policy == null) {
            throw new BusinessRuleException(ErrorCode.POLICY_NOT_FOUND, "Policy is required");
        }
        
        if (serviceDate == null) {
            serviceDate = LocalDate.now();
        }
        
        log.debug("🔍 Validating policy {} for date {}", policy.getPolicyNumber(), serviceDate);
        
        // Rule 1: Check policy status
        validatePolicyStatus(policy);
        
        // Rule 2: Check date range
        validatePolicyDateRange(policy, serviceDate);
        
        // Rule 3: Check benefit package linkage
        validateBenefitPackageLinkage(policy);
        
        log.info("✅ Policy {} is valid for date {}", policy.getPolicyNumber(), serviceDate);
    }

    /**
     * Validate a member's policy is active for a given service date.
     * 
     * @param member The member whose policy to validate
     * @param serviceDate The date of service
     * @throws PolicyNotActiveException if member's policy is not valid
     * @throws BusinessRuleException if member has no policy
     */
    public void validateMemberPolicy(Member member, LocalDate serviceDate) {
        if (member == null) {
            throw new BusinessRuleException("Member is required for policy validation");
        }
        
        // Check member has a policy
        Policy policy = member.getPolicy();
        if (policy == null) {
            throw new BusinessRuleException(
                ErrorCode.CLAIM_REQUIRES_ACTIVE_POLICY,
                String.format("Member %s has no policy assigned. Cannot process claim without active policy.",
                    member.getFullName())
            );
        }
        
        // Check member status
        if (member.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new BusinessRuleException(
                ErrorCode.MEMBER_NOT_ACTIVE,
                String.format("Member %s status is %s. Only ACTIVE members can create claims.",
                    member.getFullName(), member.getStatus())
            );
        }
        
        // Validate the policy
        validatePolicyForDate(policy, serviceDate);
    }

    /**
     * Check if policy status allows claims/visits.
     */
    private void validatePolicyStatus(Policy policy) {
        PolicyStatus status = policy.getStatus();
        
        if (status != PolicyStatus.ACTIVE) {
            String message = switch (status) {
                case PENDING -> String.format("Policy %s is pending activation", policy.getPolicyNumber());
                case SUSPENDED -> String.format("Policy %s is suspended", policy.getPolicyNumber());
                case EXPIRED -> String.format("Policy %s has expired", policy.getPolicyNumber());
                case CANCELLED -> String.format("Policy %s has been cancelled", policy.getPolicyNumber());
                case RENEWAL_PENDING -> String.format("Policy %s is pending renewal", policy.getPolicyNumber());
                default -> String.format("Policy %s is not active (status: %s)", policy.getPolicyNumber(), status);
            };
            
            log.warn("❌ Policy status validation failed: {}", message);
            throw new PolicyNotActiveException(message);
        }
    }

    /**
     * Check if service date falls within policy date range.
     */
    private void validatePolicyDateRange(Policy policy, LocalDate serviceDate) {
        LocalDate startDate = policy.getStartDate();
        LocalDate endDate = policy.getEndDate();
        
        // Check if service date is before policy start
        if (startDate != null && serviceDate.isBefore(startDate)) {
            String message = String.format(
                "Service date %s is before policy start date %s. Policy %s has not started yet.",
                serviceDate, startDate, policy.getPolicyNumber()
            );
            log.warn("❌ Policy date validation failed: {}", message);
            throw new PolicyNotActiveException(policy.getId(), policy.getPolicyNumber(), serviceDate);
        }
        
        // Check if service date is after policy end
        if (endDate != null && serviceDate.isAfter(endDate)) {
            String message = String.format(
                "Service date %s is after policy end date %s. Policy %s has expired.",
                serviceDate, endDate, policy.getPolicyNumber()
            );
            log.warn("❌ Policy date validation failed: {}", message);
            throw new PolicyNotActiveException(policy.getId(), policy.getPolicyNumber(), serviceDate);
        }
    }

    /**
     * Check that policy has a valid benefit package.
     */
    private void validateBenefitPackageLinkage(Policy policy) {
        if (policy.getBenefitPackage() == null) {
            throw new BusinessRuleException(
                ErrorCode.POLICY_NO_BENEFIT_PACKAGE,
                String.format("Policy %s has no benefit package linked. Cannot determine coverage.",
                    policy.getPolicyNumber())
            );
        }
        
        if (!policy.getBenefitPackage().getActive()) {
            throw new BusinessRuleException(
                ErrorCode.POLICY_NO_BENEFIT_PACKAGE,
                String.format("Policy %s benefit package is inactive.",
                    policy.getPolicyNumber())
            );
        }
    }

    /**
     * Quick check if policy is valid (no exception, returns boolean).
     * Useful for UI hints.
     */
    public boolean isPolicyValidForDate(Policy policy, LocalDate serviceDate) {
        try {
            validatePolicyForDate(policy, serviceDate);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
