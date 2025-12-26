package com.waad.tba.modules.policy.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.waad.tba.common.exception.CoverageValidationException;
import com.waad.tba.common.exception.CoverageValidationException.CoverageIssue;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.entity.ClaimLine;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.policy.entity.BenefitPackage;
import com.waad.tba.modules.policy.entity.Policy;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Coverage Validation Service - Validates coverage limits and service eligibility.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * VALIDATION RULES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. SERVICE COVERAGE CHECK
 *    - Verify service category is covered (dental, optical, maternity, etc.)
 *    - Verify specific service code is not excluded
 * 
 * 2. AMOUNT LIMIT VALIDATION
 *    - Annual limit per member
 *    - Per-category limits (OP, IP, dental, etc.)
 *    - Lifetime limit
 * 
 * 3. WAITING PERIOD VALIDATION
 *    - General waiting period
 *    - Maternity waiting period (typically 270 days)
 *    - Pre-existing condition waiting period
 * 
 * 4. CO-PAYMENT CALCULATION
 *    - Calculate member's co-payment percentage
 *    - Return payable amount after co-payment
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMOKE TEST SCENARIOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Scenario 1: Service Category Covered
 *   Given: BenefitPackage "Gold" has dentalCovered=true
 *   When: validateServiceCoverage("DEN-001", "Gold")
 *   Then: No exception
 * 
 * Scenario 2: Service Category Not Covered
 *   Given: BenefitPackage "Silver" has dentalCovered=false
 *   When: validateServiceCoverage("DEN-001", "Silver")
 *   Then: CoverageValidationException("Dental services not covered in package Silver")
 * 
 * Scenario 3: Annual Limit Check
 *   Given: Member "Ali" has used 48,000 of 50,000 annual limit
 *   When: validateAmountLimit(Ali, 5000)
 *   Then: CoverageValidationException("Amount 5,000 exceeds remaining limit 2,000")
 * 
 * Scenario 4: Waiting Period Not Met
 *   Given: Member "Sara" joined 2024-03-01, maternityWaitingPeriod=270 days
 *   When: validateMaternityService(Sara, 2024-06-01)
 *   Then: CoverageValidationException("Maternity waiting period not met. Eligible from 2024-11-26")
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoverageValidationService {

    private final ClaimRepository claimRepository;

    /**
     * Comprehensive coverage validation for a claim.
     * Validates all claim lines and total amount.
     * 
     * @param member The member making the claim
     * @param policy The member's active policy
     * @param requestedAmount Total claim amount
     * @param claimLines Individual service lines
     * @param serviceDate Date of service
     */
    public void validateClaimCoverage(
            Member member,
            Policy policy,
            BigDecimal requestedAmount,
            List<ClaimLine> claimLines,
            LocalDate serviceDate) {
        
        log.debug("🔍 Validating coverage for member {} amount {} on {}",
            member.getId(), requestedAmount, serviceDate);
        
        BenefitPackage benefitPackage = policy.getBenefitPackage();
        
        // Validate each claim line for service coverage
        if (claimLines != null) {
            for (ClaimLine line : claimLines) {
                validateServiceCoverage(line.getServiceCode(), benefitPackage);
            }
        }
        
        // Validate amount limits
        validateAmountLimits(member, policy, requestedAmount, serviceDate);
        
        // Validate waiting periods if applicable
        validateWaitingPeriods(member, policy, claimLines, serviceDate);
        
        log.info("✅ Coverage validated for member {} claim amount {}",
            member.getId(), requestedAmount);
    }

    /**
     * Validate that a service is covered in the benefit package.
     * Uses service code prefix to determine category.
     */
    public void validateServiceCoverage(String serviceCode, BenefitPackage benefitPackage) {
        if (serviceCode == null || serviceCode.isBlank()) {
            return; // No service code to validate
        }
        
        String categoryPrefix = serviceCode.substring(0, Math.min(3, serviceCode.length())).toUpperCase();
        
        switch (categoryPrefix) {
            case "DEN" -> { // Dental services
                if (!Boolean.TRUE.equals(benefitPackage.getDentalCovered())) {
                    throw new CoverageValidationException(
                        CoverageIssue.SERVICE_NOT_COVERED,
                        serviceCode,
                        String.format("Dental services (code: %s) are not covered in benefit package '%s'",
                            serviceCode, benefitPackage.getNameEn())
                    );
                }
            }
            case "OPT" -> { // Optical services
                if (!Boolean.TRUE.equals(benefitPackage.getOpticalCovered())) {
                    throw new CoverageValidationException(
                        CoverageIssue.SERVICE_NOT_COVERED,
                        serviceCode,
                        String.format("Optical services (code: %s) are not covered in benefit package '%s'",
                            serviceCode, benefitPackage.getNameEn())
                    );
                }
            }
            case "MAT" -> { // Maternity services
                if (!Boolean.TRUE.equals(benefitPackage.getMaternityCovered())) {
                    throw new CoverageValidationException(
                        CoverageIssue.SERVICE_NOT_COVERED,
                        serviceCode,
                        String.format("Maternity services (code: %s) are not covered in benefit package '%s'",
                            serviceCode, benefitPackage.getNameEn())
                    );
                }
            }
            case "PHR", "RX" -> { // Pharmacy services
                if (!Boolean.TRUE.equals(benefitPackage.getPharmacyCovered())) {
                    throw new CoverageValidationException(
                        CoverageIssue.SERVICE_NOT_COVERED,
                        serviceCode,
                        String.format("Pharmacy services (code: %s) are not covered in benefit package '%s'",
                            serviceCode, benefitPackage.getNameEn())
                    );
                }
            }
            case "CHR" -> { // Chronic disease services
                if (!Boolean.TRUE.equals(benefitPackage.getChronicDiseaseCovered())) {
                    throw new CoverageValidationException(
                        CoverageIssue.SERVICE_NOT_COVERED,
                        serviceCode,
                        String.format("Chronic disease services (code: %s) are not covered in benefit package '%s'",
                            serviceCode, benefitPackage.getNameEn())
                    );
                }
            }
            // Default: OP/IP services are typically covered
            default -> {
                // General services - check basic coverage
                log.debug("Service {} categorized as general coverage", serviceCode);
            }
        }
    }

    /**
     * Validate amount against coverage limits.
     */
    public void validateAmountLimits(
            Member member,
            Policy policy,
            BigDecimal requestedAmount,
            LocalDate serviceDate) {
        
        BenefitPackage benefitPackage = policy.getBenefitPackage();
        
        // Check annual limit per member
        BigDecimal annualLimit = benefitPackage.getAnnualLimitPerMember();
        if (annualLimit != null && annualLimit.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal usedAmount = calculateUsedAmountForYear(member.getId(), serviceDate.getYear());
            BigDecimal remainingLimit = annualLimit.subtract(usedAmount);
            
            if (requestedAmount.compareTo(remainingLimit) > 0) {
                log.warn("❌ Annual limit exceeded: requested={}, remaining={}", requestedAmount, remainingLimit);
                throw new CoverageValidationException(
                    CoverageIssue.AMOUNT_LIMIT_EXCEEDED,
                    requestedAmount,
                    remainingLimit
                );
            }
        }
        
        // Check policy-level limits
        BigDecimal policyLimit = policy.getPerMemberLimit();
        if (policyLimit != null && policyLimit.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalUsed = calculateTotalUsedForPolicy(member.getId(), policy.getId());
            BigDecimal remaining = policyLimit.subtract(totalUsed);
            
            if (requestedAmount.compareTo(remaining) > 0) {
                log.warn("❌ Policy limit exceeded: requested={}, remaining={}", requestedAmount, remaining);
                throw new CoverageValidationException(
                    CoverageIssue.AMOUNT_LIMIT_EXCEEDED,
                    requestedAmount,
                    remaining
                );
            }
        }
        
        // Check lifetime limit
        BigDecimal lifetimeLimit = benefitPackage.getLifetimeLimitPerMember();
        if (lifetimeLimit != null && lifetimeLimit.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal lifetimeUsed = calculateLifetimeUsed(member.getId());
            BigDecimal lifetimeRemaining = lifetimeLimit.subtract(lifetimeUsed);
            
            if (requestedAmount.compareTo(lifetimeRemaining) > 0) {
                log.warn("❌ Lifetime limit exceeded: requested={}, remaining={}", requestedAmount, lifetimeRemaining);
                throw new CoverageValidationException(
                    CoverageIssue.BENEFIT_EXHAUSTED,
                    String.format("Lifetime benefit limit exhausted. Remaining: %.2f LYD", lifetimeRemaining)
                );
            }
        }
    }

    /**
     * Validate waiting periods for specific services.
     */
    public void validateWaitingPeriods(
            Member member,
            Policy policy,
            List<ClaimLine> claimLines,
            LocalDate serviceDate) {
        
        LocalDate memberStartDate = member.getStartDate();
        if (memberStartDate == null) {
            memberStartDate = member.getJoinDate();
        }
        if (memberStartDate == null) {
            return; // Cannot validate without dates
        }
        
        // General waiting period
        Integer generalWaiting = policy.getGeneralWaitingPeriodDays();
        if (generalWaiting != null && generalWaiting > 0) {
            LocalDate eligibleDate = memberStartDate.plusDays(generalWaiting);
            if (serviceDate.isBefore(eligibleDate)) {
                throw new CoverageValidationException(
                    CoverageIssue.WAITING_PERIOD_NOT_MET,
                    String.format("General waiting period not met. Member eligible for coverage from %s",
                        eligibleDate)
                );
            }
        }
        
        // Check for maternity services
        if (claimLines != null) {
            boolean hasMaternity = claimLines.stream()
                .anyMatch(line -> line.getServiceCode() != null && 
                         line.getServiceCode().toUpperCase().startsWith("MAT"));
            
            if (hasMaternity) {
                Integer maternityWaiting = policy.getMaternityWaitingPeriodDays();
                if (maternityWaiting != null && maternityWaiting > 0) {
                    LocalDate eligibleDate = memberStartDate.plusDays(maternityWaiting);
                    if (serviceDate.isBefore(eligibleDate)) {
                        throw new CoverageValidationException(
                            CoverageIssue.WAITING_PERIOD_NOT_MET,
                            String.format("Maternity waiting period (%d days) not met. Eligible from %s",
                                maternityWaiting, eligibleDate)
                        );
                    }
                }
            }
        }
    }

    /**
     * Calculate co-payment amount based on benefit package.
     * Returns the amount the insurance will pay (after co-pay deduction).
     */
    public BigDecimal calculatePayableAmount(BigDecimal requestedAmount, BenefitPackage benefitPackage, String serviceType) {
        BigDecimal coPayPercentage = getCoPayPercentage(benefitPackage, serviceType);
        
        if (coPayPercentage == null || coPayPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return requestedAmount; // No co-pay, full amount payable
        }
        
        // Calculate: payable = requested * (100 - coPayPercentage) / 100
        BigDecimal insurancePercentage = BigDecimal.valueOf(100).subtract(coPayPercentage);
        return requestedAmount.multiply(insurancePercentage).divide(BigDecimal.valueOf(100));
    }

    /**
     * Get co-payment percentage for service type.
     */
    private BigDecimal getCoPayPercentage(BenefitPackage bp, String serviceType) {
        if (serviceType == null) {
            return bp.getOpCoPaymentPercentage(); // Default to OP
        }
        
        return switch (serviceType.toUpperCase()) {
            case "IP", "INPATIENT" -> bp.getIpCoPaymentPercentage();
            case "OP", "OUTPATIENT" -> bp.getOpCoPaymentPercentage();
            default -> bp.getOpCoPaymentPercentage();
        };
    }

    // ========== Helper Methods for Amount Calculation ==========

    /**
     * Calculate used amount for a member in a specific year.
     */
    private BigDecimal calculateUsedAmountForYear(Long memberId, int year) {
        List<Claim> claims = claimRepository.findByMemberId(memberId);
        
        return claims.stream()
            .filter(c -> c.getVisitDate() != null && c.getVisitDate().getYear() == year)
            .filter(c -> c.getApprovedAmount() != null)
            .map(Claim::getApprovedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate total used for a member under their benefit policy.
     * Since Claim no longer has insurancePolicy reference, we calculate
     * total used from all claims for the member (benefit policy is per-member).
     */
    private BigDecimal calculateTotalUsedForPolicy(Long memberId, Long policyId) {
        List<Claim> claims = claimRepository.findByMemberId(memberId);
        
        // Calculate total approved amounts from all claims for this member
        // The policyId parameter is kept for API compatibility but not used
        // since coverage is now determined by Member.benefitPolicy
        return claims.stream()
            .filter(c -> c.getApprovedAmount() != null)
            .map(Claim::getApprovedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate lifetime used amount for a member.
     */
    private BigDecimal calculateLifetimeUsed(Long memberId) {
        List<Claim> claims = claimRepository.findByMemberId(memberId);
        
        return claims.stream()
            .filter(c -> c.getApprovedAmount() != null)
            .map(Claim::getApprovedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get remaining coverage for a member (for UI display).
     */
    public BigDecimal getRemainingCoverage(Member member, Policy policy, LocalDate asOfDate) {
        BenefitPackage bp = policy.getBenefitPackage();
        BigDecimal annualLimit = bp.getAnnualLimitPerMember();
        
        if (annualLimit == null || annualLimit.compareTo(BigDecimal.ZERO) <= 0) {
            return null; // Unlimited or not configured
        }
        
        BigDecimal used = calculateUsedAmountForYear(member.getId(), asOfDate.getYear());
        return annualLimit.subtract(used).max(BigDecimal.ZERO);
    }
}
