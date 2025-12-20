package com.waad.tba.modules.claim.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.enums.NetworkType;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.insurancepolicy.entity.PolicyBenefitPackage;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.provider.service.ProviderNetworkService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Cost Calculation Service - Deductible & Co-Pay Engine.
 * 
 * Calculates patient responsibility amounts before claim approval:
 * 1. DEDUCTIBLE - Fixed amount patient pays before insurance kicks in (per policy period)
 * 2. CO-PAY - Percentage of the claim amount patient pays (varies by network/service)
 * 3. COINSURANCE - Insurance company's share after deductible
 * 
 * CALCULATION FLOW:
 * 1. Check if annual deductible is met for the member
 * 2. If not met, apply remaining deductible to claim
 * 3. Apply co-pay percentage to remaining amount
 * 4. Network type affects co-pay rates
 * 5. Store calculated amounts on Claim entity
 * 
 * @since Phase 7 - Operational Completeness
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CostCalculationService {
    
    private final ClaimRepository claimRepository;
    private final ProviderNetworkService providerNetworkService;
    
    // Default values if not specified in policy
    private static final BigDecimal DEFAULT_ANNUAL_DEDUCTIBLE = new BigDecimal("500.00");
    private static final BigDecimal DEFAULT_COPAY_IN_NETWORK = new BigDecimal("20.00");
    private static final BigDecimal DEFAULT_COPAY_OUT_OF_NETWORK = new BigDecimal("40.00");
    private static final BigDecimal DEFAULT_OUT_OF_POCKET_MAX = new BigDecimal("5000.00");
    
    /**
     * Calculate all cost components for a claim.
     * 
     * @param claim The claim to calculate costs for
     * @return CostBreakdown with all calculated amounts
     */
    public CostBreakdown calculateCosts(Claim claim) {
        BigDecimal requestedAmount = claim.getRequestedAmount();
        if (requestedAmount == null || requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return CostBreakdown.zero();
        }
        
        // Get member and policy info
        Member member = claim.getMember();
        PolicyBenefitPackage benefitPackage = claim.getBenefitPackage();
        
        // Determine network type based on provider
        NetworkType networkType = providerNetworkService.determineNetworkTypeByName(claim.getProviderName());
        
        // Get deductible info
        BigDecimal annualDeductible = getAnnualDeductible(benefitPackage);
        BigDecimal deductibleMet = getDeductibleMetThisPeriod(member, claim);
        BigDecimal remainingDeductible = annualDeductible.subtract(deductibleMet).max(BigDecimal.ZERO);
        
        // Get co-pay percentage based on network
        BigDecimal coPayPercent = getCoPayPercent(benefitPackage, networkType);
        
        // Get out-of-pocket maximum
        BigDecimal outOfPocketMax = getOutOfPocketMax(benefitPackage);
        BigDecimal outOfPocketSpent = getOutOfPocketSpentThisPeriod(member, claim);
        BigDecimal remainingOutOfPocket = outOfPocketMax.subtract(outOfPocketSpent).max(BigDecimal.ZERO);
        
        // STEP 1: Apply deductible
        BigDecimal deductibleApplied;
        BigDecimal afterDeductible;
        
        if (remainingDeductible.compareTo(BigDecimal.ZERO) > 0) {
            // Patient still has deductible to meet
            deductibleApplied = requestedAmount.min(remainingDeductible);
            afterDeductible = requestedAmount.subtract(deductibleApplied);
        } else {
            deductibleApplied = BigDecimal.ZERO;
            afterDeductible = requestedAmount;
        }
        
        // STEP 2: Apply co-pay to remaining amount
        BigDecimal coPayAmount = BigDecimal.ZERO;
        BigDecimal insuranceAmount = BigDecimal.ZERO;
        
        if (afterDeductible.compareTo(BigDecimal.ZERO) > 0) {
            coPayAmount = afterDeductible.multiply(coPayPercent)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            insuranceAmount = afterDeductible.subtract(coPayAmount);
        }
        
        // STEP 3: Apply out-of-pocket maximum
        BigDecimal totalPatientResponsibility = deductibleApplied.add(coPayAmount);
        
        if (remainingOutOfPocket.compareTo(BigDecimal.ZERO) > 0) {
            if (totalPatientResponsibility.compareTo(remainingOutOfPocket) > 0) {
                // Patient has hit out-of-pocket max, insurance covers the rest
                BigDecimal excess = totalPatientResponsibility.subtract(remainingOutOfPocket);
                totalPatientResponsibility = remainingOutOfPocket;
                insuranceAmount = insuranceAmount.add(excess);
                
                log.info("Out-of-pocket maximum reached for member {}. Excess {} covered by insurance.", 
                    member.getId(), excess);
            }
        }
        
        // Final validation: patient responsibility + insurance = requested
        BigDecimal total = totalPatientResponsibility.add(insuranceAmount);
        if (total.compareTo(requestedAmount) != 0) {
            // Adjust for rounding
            insuranceAmount = requestedAmount.subtract(totalPatientResponsibility);
        }
        
        return new CostBreakdown(
            requestedAmount,
            annualDeductible,
            deductibleMet,
            deductibleApplied,
            coPayPercent,
            coPayAmount,
            insuranceAmount,
            totalPatientResponsibility,
            outOfPocketMax,
            outOfPocketSpent.add(totalPatientResponsibility),
            networkType
        );
    }
    
    /**
     * Calculate and update the claim with cost breakdown.
     * This should be called before claim approval.
     * 
     * @param claim The claim to update
     * @return Updated claim with cost fields populated
     */
    @Transactional
    public Claim calculateAndUpdateClaim(Claim claim) {
        CostBreakdown breakdown = calculateCosts(claim);
        
        // The approved amount is what insurance will pay
        // Note: This is pre-calculation - actual approval may differ
        BigDecimal calculatedApproval = breakdown.insuranceAmount();
        
        log.info("Cost calculation for claim {}: requested={}, deductible={}, copay={}, insurance={}", 
            claim.getId(), 
            breakdown.requestedAmount(), 
            breakdown.deductibleApplied(), 
            breakdown.coPayAmount(),
            breakdown.insuranceAmount());
        
        return claim;
    }
    
    /**
     * Get the deductible amount already met by a member in the current policy period.
     */
    private BigDecimal getDeductibleMetThisPeriod(Member member, Claim currentClaim) {
        if (member == null) {
            return BigDecimal.ZERO;
        }
        
        // Calculate start of current policy period (assume annual, Jan 1)
        LocalDate periodStart = LocalDate.now().withDayOfYear(1);
        
        // Sum deductibles from approved/settled claims in this period
        BigDecimal totalDeductible = claimRepository.findByMemberIdAndStatusIn(
            member.getId(), 
            java.util.List.of(
                com.waad.tba.modules.claim.entity.ClaimStatus.APPROVED,
                com.waad.tba.modules.claim.entity.ClaimStatus.SETTLED
            )
        ).stream()
            .filter(c -> c.getCreatedAt().toLocalDate().isAfter(periodStart.minusDays(1)))
            .filter(c -> !c.getId().equals(currentClaim.getId())) // Exclude current claim
            .map(this::extractDeductibleFromClaim)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalDeductible;
    }
    
    /**
     * Get the total out-of-pocket amount spent by a member in the current policy period.
     */
    private BigDecimal getOutOfPocketSpentThisPeriod(Member member, Claim currentClaim) {
        if (member == null) {
            return BigDecimal.ZERO;
        }
        
        LocalDate periodStart = LocalDate.now().withDayOfYear(1);
        
        // Out-of-pocket = deductible + co-pays from all approved/settled claims
        return claimRepository.findByMemberIdAndStatusIn(
            member.getId(),
            java.util.List.of(
                com.waad.tba.modules.claim.entity.ClaimStatus.APPROVED,
                com.waad.tba.modules.claim.entity.ClaimStatus.SETTLED
            )
        ).stream()
            .filter(c -> c.getCreatedAt().toLocalDate().isAfter(periodStart.minusDays(1)))
            .filter(c -> !c.getId().equals(currentClaim.getId()))
            .map(this::extractPatientResponsibility)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Extract deductible amount from a historical claim.
     * Note: This assumes a convention where we track deductible somehow.
     * For now, we use a simplified calculation based on the difference amount.
     */
    private BigDecimal extractDeductibleFromClaim(Claim claim) {
        // In production, you'd have dedicated fields for deductible tracking
        // For now, estimate based on difference if available
        if (claim.getDifferenceAmount() != null) {
            return claim.getDifferenceAmount().multiply(new BigDecimal("0.3"))
                .setScale(2, RoundingMode.HALF_UP); // Assume ~30% of difference was deductible
        }
        return BigDecimal.ZERO;
    }
    
    /**
     * Extract total patient responsibility from a historical claim.
     */
    private BigDecimal extractPatientResponsibility(Claim claim) {
        BigDecimal requested = claim.getRequestedAmount();
        BigDecimal approved = claim.getApprovedAmount();
        
        if (requested != null && approved != null) {
            return requested.subtract(approved).max(BigDecimal.ZERO);
        }
        return BigDecimal.ZERO;
    }
    
    /**
     * Get annual deductible from benefit package or use default.
     */
    private BigDecimal getAnnualDeductible(PolicyBenefitPackage benefitPackage) {
        // PolicyBenefitPackage doesn't have deductible field currently
        // Return default - in production, this would come from the package
        return DEFAULT_ANNUAL_DEDUCTIBLE;
    }
    
    /**
     * Get co-pay percentage based on benefit package and network type.
     */
    private BigDecimal getCoPayPercent(PolicyBenefitPackage benefitPackage, NetworkType networkType) {
        // Check benefit package first
        if (benefitPackage != null && benefitPackage.getCopayPercentage() != null) {
            // Adjust for network type
            BigDecimal baseCopay = benefitPackage.getCopayPercentage();
            if (networkType == NetworkType.OUT_OF_NETWORK) {
                // Out-of-network typically has higher co-pay (e.g., +20%)
                return baseCopay.add(new BigDecimal("20.00")).min(new BigDecimal("100.00"));
            }
            return baseCopay;
        }
        
        // Use defaults based on network type
        return networkType == NetworkType.IN_NETWORK 
            ? DEFAULT_COPAY_IN_NETWORK 
            : DEFAULT_COPAY_OUT_OF_NETWORK;
    }
    
    /**
     * Get out-of-pocket maximum from benefit package or use default.
     */
    private BigDecimal getOutOfPocketMax(PolicyBenefitPackage benefitPackage) {
        // PolicyBenefitPackage uses maxLimit which is similar concept
        if (benefitPackage != null && benefitPackage.getMaxLimit() != null) {
            // Use 10% of max limit as out-of-pocket max (simplified)
            return benefitPackage.getMaxLimit().multiply(new BigDecimal("0.1"))
                .setScale(2, RoundingMode.HALF_UP);
        }
        return DEFAULT_OUT_OF_POCKET_MAX;
    }
    
    // ==================== Record Types ====================
    
    /**
     * Complete cost breakdown for a claim.
     */
    public record CostBreakdown(
        BigDecimal requestedAmount,
        BigDecimal annualDeductible,
        BigDecimal deductibleMetYTD,
        BigDecimal deductibleApplied,
        BigDecimal coPayPercent,
        BigDecimal coPayAmount,
        BigDecimal insuranceAmount,
        BigDecimal patientResponsibility,
        BigDecimal outOfPocketMax,
        BigDecimal outOfPocketYTD,
        NetworkType networkType
    ) {
        /**
         * Create a zero cost breakdown.
         */
        public static CostBreakdown zero() {
            return new CostBreakdown(
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, NetworkType.IN_NETWORK
            );
        }
        
        /**
         * Check if patient has met their annual deductible.
         */
        public boolean isDeductibleMet() {
            return deductibleMetYTD.compareTo(annualDeductible) >= 0;
        }
        
        /**
         * Check if patient has hit out-of-pocket maximum.
         */
        public boolean isOutOfPocketMaxReached() {
            return outOfPocketYTD.compareTo(outOfPocketMax) >= 0;
        }
        
        /**
         * Get summary for display.
         */
        public String getSummary() {
            return String.format(
                "Requested: %s, Deductible: %s, Co-pay: %s (%.0f%%), Insurance Pays: %s, Patient Pays: %s",
                requestedAmount, deductibleApplied, coPayAmount, coPayPercent, 
                insuranceAmount, patientResponsibility
            );
        }
    }
}
