package com.waad.tba.modules.eligibility.domain;

import com.waad.tba.modules.benefitpolicy.entity.BenefitPolicy;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.policy.entity.Policy;
import com.waad.tba.modules.provider.entity.Provider;
import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.common.entity.Organization;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Eligibility Context
 * Phase E1 - Eligibility Engine
 * 
 * Aggregates all input data needed for eligibility evaluation.
 * This object is passed to each rule for evaluation.
 * 
 * The context is immutable once created - rules cannot modify it.
 * 
 * @author TBA WAAD System
 * @version 2025.1
 */
@Data
@Builder
public class EligibilityContext {

    // ============================================
    // Request Parameters (from API)
    // ============================================

    /**
     * Unique request ID for tracking
     */
    private final String requestId;

    /**
     * Member ID to check
     */
    private final Long memberId;

    /**
     * Policy ID (may be auto-resolved from member)
     */
    private final Long policyId;
    
    /**
     * BenefitPolicy ID (may be auto-resolved from member)
     */
    private final Long benefitPolicyId;

    /**
     * Provider ID (optional)
     */
    private final Long providerId;

    /**
     * Service date to check eligibility for
     */
    private final LocalDate serviceDate;

    /**
     * Service code (optional, for future phases)
     */
    private final String serviceCode;

    // ============================================
    // Resolved Entities (loaded from database)
    // ============================================

    /**
     * Resolved member entity
     */
    private final Member member;

    /**
     * Resolved policy entity (legacy - kept for backward compatibility)
     */
    private final Policy policy;
    
    /**
     * Resolved BenefitPolicy entity (canonical source)
     */
    private final BenefitPolicy benefitPolicy;

    /**
     * Resolved provider entity (optional)
     */
    private final Provider provider;

    /**
     * Resolved employer organization
     */
    private final Organization employerOrganization;

    // ============================================
    // Security Context
    // ============================================

    /**
     * User performing the check
     */
    private final Long checkedByUserId;

    /**
     * Username performing the check
     */
    private final String checkedByUsername;

    /**
     * Company/Organization scope of the user
     */
    private final Long companyScopeId;

    /**
     * Is the user a SUPER_ADMIN (bypass some checks)
     */
    private final boolean superAdmin;

    /**
     * IP address of the request
     */
    private final String ipAddress;

    /**
     * User agent of the request
     */
    private final String userAgent;

    // ============================================
    // Timing
    // ============================================

    /**
     * When the check was initiated
     */
    @Builder.Default
    private final LocalDateTime checkTimestamp = LocalDateTime.now();

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Check if member was resolved
     */
    public boolean hasMember() {
        return member != null;
    }

    /**
     * Check if policy was resolved (legacy)
     */
    public boolean hasPolicy() {
        return policy != null;
    }
    
    /**
     * Check if BenefitPolicy was resolved (canonical)
     */
    public boolean hasBenefitPolicy() {
        return benefitPolicy != null;
    }
    
    /**
     * Check if any policy (legacy or BenefitPolicy) was resolved
     */
    public boolean hasAnyPolicy() {
        return policy != null || benefitPolicy != null;
    }

    /**
     * Check if provider was resolved
     */
    public boolean hasProvider() {
        return provider != null;
    }

    /**
     * Get member status safely
     */
    public Member.MemberStatus getMemberStatus() {
        return member != null ? member.getStatus() : null;
    }

    /**
     * Get policy status safely (legacy)
     */
    public Policy.PolicyStatus getPolicyStatus() {
        return policy != null ? policy.getStatus() : null;
    }

    /**
     * Get member's employer ID safely
     */
    public Long getMemberEmployerId() {
        if (member == null) return null;
        if (member.getEmployerOrganization() != null) {
            return member.getEmployerOrganization().getId();
        }
        return null;
    }

    /**
     * Get policy's employer ID safely
     */
    public Long getPolicyEmployerId() {
        if (policy == null) return null;
        if (policy.getEmployerOrganization() != null) {
            return policy.getEmployerOrganization().getId();
        }
        return null;
    }

    /**
     * Check if member belongs to the given employer
     */
    public boolean memberBelongsToEmployer(Long employerId) {
        Long memberEmployerId = getMemberEmployerId();
        return memberEmployerId != null && memberEmployerId.equals(employerId);
    }

    /**
     * Check if the service date falls within policy coverage period
     */
    public boolean serviceDateInCoveragePeriod() {
        // First check BenefitPolicy (canonical)
        if (benefitPolicy != null && serviceDate != null) {
            return benefitPolicy.isEffectiveOn(serviceDate);
        }
        
        // Fallback to legacy Policy
        if (policy == null || serviceDate == null) return false;
        
        LocalDate start = policy.getStartDate();
        LocalDate end = policy.getEndDate();
        
        if (start == null || end == null) return false;
        
        return !serviceDate.isBefore(start) && !serviceDate.isAfter(end);
    }
    
    /**
     * Check if service date is in BenefitPolicy coverage period
     */
    public boolean serviceDateInBenefitPolicyCoveragePeriod() {
        if (benefitPolicy == null || serviceDate == null) return false;
        return benefitPolicy.isEffectiveOn(serviceDate);
    }
    
    /**
     * Get the effective waiting period days.
     * Uses BenefitPolicy.defaultWaitingPeriodDays if available,
     * otherwise falls back to legacy Policy.generalWaitingPeriodDays.
     */
    public Integer getEffectiveWaitingPeriodDays() {
        if (benefitPolicy != null && benefitPolicy.getDefaultWaitingPeriodDays() != null) {
            return benefitPolicy.getDefaultWaitingPeriodDays();
        }
        if (policy != null) {
            return policy.getGeneralWaitingPeriodDays();
        }
        return 0;
    }
    
    /**
     * Get BenefitPolicy status safely
     */
    public BenefitPolicy.BenefitPolicyStatus getBenefitPolicyStatus() {
        return benefitPolicy != null ? benefitPolicy.getStatus() : null;
    }

    /**
     * Get days since member enrollment
     */
    public long getDaysSinceEnrollment() {
        if (member == null || member.getStartDate() == null || serviceDate == null) {
            return -1;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(member.getStartDate(), serviceDate);
    }
}
