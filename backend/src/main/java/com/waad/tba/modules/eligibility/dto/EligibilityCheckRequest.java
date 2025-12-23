package com.waad.tba.modules.eligibility.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Eligibility Check Request DTO
 * Phase E1 - Eligibility Engine
 * 
 * Input for eligibility verification.
 * 
 * Required:
 * - memberId: The member to check eligibility for
 * - serviceDate: The date of service
 * 
 * Optional:
 * - policyId: If not provided, uses member's current policy
 * - providerId: For network validation (future)
 * - serviceCode: For service-specific rules (future)
 * 
 * @author TBA WAAD System
 * @version 2025.1
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityCheckRequest {

    /**
     * Member ID to check eligibility for
     * Required
     */
    @NotNull(message = "Member ID is required")
    private Long memberId;

    /**
     * Policy ID to verify against
     * Optional - if null, uses member's current active policy
     */
    private Long policyId;

    /**
     * Provider ID for network validation
     * Optional - for future in-network checks
     */
    private Long providerId;

    /**
     * Service date to check eligibility for
     * Required
     */
    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    /**
     * Service code (CPT, ICD, etc.)
     * Optional - for service-specific eligibility rules
     */
    private String serviceCode;

    /**
     * Convenient factory method for simple checks
     */
    public static EligibilityCheckRequest of(Long memberId, LocalDate serviceDate) {
        return EligibilityCheckRequest.builder()
                .memberId(memberId)
                .serviceDate(serviceDate)
                .build();
    }

    /**
     * Factory method with policy override
     */
    public static EligibilityCheckRequest of(Long memberId, Long policyId, LocalDate serviceDate) {
        return EligibilityCheckRequest.builder()
                .memberId(memberId)
                .policyId(policyId)
                .serviceDate(serviceDate)
                .build();
    }

    /**
     * Full factory method
     */
    public static EligibilityCheckRequest of(Long memberId, Long policyId, Long providerId, 
                                              LocalDate serviceDate, String serviceCode) {
        return EligibilityCheckRequest.builder()
                .memberId(memberId)
                .policyId(policyId)
                .providerId(providerId)
                .serviceDate(serviceDate)
                .serviceCode(serviceCode)
                .build();
    }
}
