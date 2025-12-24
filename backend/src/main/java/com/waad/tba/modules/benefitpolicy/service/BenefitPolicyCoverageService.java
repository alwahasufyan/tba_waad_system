package com.waad.tba.modules.benefitpolicy.service;

import com.waad.tba.common.exception.BusinessRuleException;
import com.waad.tba.modules.benefitpolicy.dto.BenefitPolicyRuleResponseDto;
import com.waad.tba.modules.benefitpolicy.entity.BenefitPolicy;
import com.waad.tba.modules.benefitpolicy.entity.BenefitPolicy.BenefitPolicyStatus;
import com.waad.tba.modules.benefitpolicy.entity.BenefitPolicyRule;
import com.waad.tba.modules.benefitpolicy.repository.BenefitPolicyRepository;
import com.waad.tba.modules.benefitpolicy.repository.BenefitPolicyRuleRepository;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.medicalservice.MedicalService;
import com.waad.tba.modules.medicalservice.MedicalServiceRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for validating coverage using BenefitPolicy rules.
 * 
 * This is the SINGLE SOURCE OF TRUTH for coverage decisions.
 * All claim processing should use this service to determine:
 * - Whether a service is covered
 * - What coverage percentage applies
 * - Whether pre-approval is required
 * - Amount limits per service/category
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * COVERAGE DECISION FLOW
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. Check member has active BenefitPolicy
 * 2. Check policy is effective on service date
 * 3. For each service in claim:
 *    a. Find applicable rule (service-specific > category)
 *    b. If no rule → NOT COVERED
 *    c. Check pre-approval requirement
 *    d. Apply coverage percentage
 *    e. Check amount limits
 * 4. Return coverage result with breakdown
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BenefitPolicyCoverageService {

    private final BenefitPolicyRepository policyRepository;
    private final BenefitPolicyRuleRepository ruleRepository;
    private final MedicalServiceRepository serviceRepository;

    // ═══════════════════════════════════════════════════════════════════════════
    // POLICY VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Validate that member has an active, effective benefit policy.
     * 
     * @param member The member
     * @param serviceDate The date of service
     * @throws BusinessRuleException if no valid policy exists
     */
    public void validateMemberHasActivePolicy(Member member, LocalDate serviceDate) {
        BenefitPolicy policy = member.getBenefitPolicy();
        
        if (policy == null) {
            throw new BusinessRuleException(
                String.format("Member %s has no assigned Benefit Policy. Cannot process claim.",
                    member.getFullName()));
        }

        if (!policy.isActive()) {
            throw new BusinessRuleException(
                String.format("Member's Benefit Policy '%s' is inactive (soft deleted). Cannot process claim.",
                    policy.getName()));
        }

        if (policy.getStatus() != BenefitPolicyStatus.ACTIVE) {
            throw new BusinessRuleException(
                String.format("Member's Benefit Policy '%s' status is %s. Only ACTIVE policies can be used for claims.",
                    policy.getName(), policy.getStatus()));
        }

        if (!policy.isEffectiveOn(serviceDate)) {
            throw new BusinessRuleException(
                String.format("Member's Benefit Policy '%s' is not effective on %s. Policy period: %s to %s",
                    policy.getName(), serviceDate, policy.getStartDate(), policy.getEndDate()));
        }

        log.debug("✅ Member {} has valid policy '{}' for date {}", 
            member.getCivilId(), policy.getName(), serviceDate);
    }

    /**
     * Check if member has an active policy (non-throwing)
     */
    public boolean hasActivePolicy(Member member, LocalDate serviceDate) {
        try {
            validateMemberHasActivePolicy(member, serviceDate);
            return true;
        } catch (BusinessRuleException e) {
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SERVICE COVERAGE LOOKUP
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Check if a specific service is covered under the member's policy.
     * 
     * @param member The member
     * @param serviceId The medical service ID
     * @return Coverage info, or empty if not covered
     */
    public Optional<CoverageInfo> getCoverageForService(Member member, Long serviceId) {
        BenefitPolicy policy = member.getBenefitPolicy();
        if (policy == null) {
            return Optional.empty();
        }

        MedicalService service = serviceRepository.findById(serviceId).orElse(null);
        if (service == null) {
            return Optional.empty();
        }

        Long categoryId = (service.getCategoryEntity() != null) 
            ? service.getCategoryEntity().getId() 
            : null;

        Optional<BenefitPolicyRule> ruleOpt = ruleRepository.findBestRuleForService(
            policy.getId(), serviceId, categoryId);

        if (ruleOpt.isEmpty()) {
            log.debug("❌ Service {} not covered under policy {}", serviceId, policy.getName());
            return Optional.empty();
        }

        BenefitPolicyRule rule = ruleOpt.get();
        
        return Optional.of(CoverageInfo.builder()
            .covered(true)
            .coveragePercent(rule.getEffectiveCoveragePercent())
            .amountLimit(rule.getAmountLimit())
            .timesLimit(rule.getTimesLimit())
            .requiresPreApproval(rule.isRequiresPreApproval())
            .waitingPeriodDays(rule.getWaitingPeriodDays())
            .ruleId(rule.getId())
            .ruleType(rule.isCategoryRule() ? "CATEGORY" : "SERVICE")
            .serviceName(service.getNameAr())
            .categoryName(service.getCategoryEntity() != null ? service.getCategoryEntity().getNameAr() : null)
            .build());
    }

    /**
     * Check if a service requires pre-approval
     */
    public boolean requiresPreApproval(Member member, Long serviceId) {
        return getCoverageForService(member, serviceId)
            .map(CoverageInfo::isRequiresPreApproval)
            .orElse(false);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CLAIM VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Validate coverage for all services in a claim.
     * 
     * @param member The member making the claim
     * @param serviceItems The services in the claim (simplified input)
     * @param serviceDate Date of service
     * @return Validation result with coverage breakdown
     */
    public ClaimCoverageResult validateClaimCoverage(
            Member member, 
            List<ServiceCoverageInput> serviceItems, 
            LocalDate serviceDate) {
        
        // First validate policy is active
        validateMemberHasActivePolicy(member, serviceDate);

        BenefitPolicy policy = member.getBenefitPolicy();
        List<ServiceCoverageResult> serviceResults = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        BigDecimal totalRequestedAmount = BigDecimal.ZERO;
        BigDecimal totalCoveredAmount = BigDecimal.ZERO;
        BigDecimal totalPatientAmount = BigDecimal.ZERO;

        for (ServiceCoverageInput item : serviceItems) {
            ServiceCoverageResult result = validateServiceCoverageForInput(policy, item);
            serviceResults.add(result);

            if (!result.isCovered()) {
                errors.add(String.format("Service '%s' is not covered under policy '%s'",
                    result.getServiceName(), policy.getName()));
            } else {
                if (result.isRequiresPreApproval()) {
                    warnings.add(String.format("Service '%s' requires pre-approval",
                        result.getServiceName()));
                }

                // Calculate amounts
                BigDecimal lineAmount = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
                totalRequestedAmount = totalRequestedAmount.add(lineAmount);

                BigDecimal covered = lineAmount
                    .multiply(BigDecimal.valueOf(result.getCoveragePercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                
                // Apply amount limit if exists
                if (result.getAmountLimit() != null && covered.compareTo(result.getAmountLimit()) > 0) {
                    covered = result.getAmountLimit();
                    warnings.add(String.format("Service '%s' amount limited to %.2f",
                        result.getServiceName(), result.getAmountLimit()));
                }

                totalCoveredAmount = totalCoveredAmount.add(covered);
                totalPatientAmount = totalPatientAmount.add(lineAmount.subtract(covered));
            }
        }

        return ClaimCoverageResult.builder()
            .valid(errors.isEmpty())
            .policyId(policy.getId())
            .policyName(policy.getName())
            .totalRequestedAmount(totalRequestedAmount)
            .totalCoveredAmount(totalCoveredAmount)
            .totalPatientAmount(totalPatientAmount)
            .defaultCoveragePercent(policy.getDefaultCoveragePercent())
            .serviceResults(serviceResults)
            .errors(errors)
            .warnings(warnings)
            .build();
    }

    /**
     * Validate a single service coverage from input DTO
     */
    private ServiceCoverageResult validateServiceCoverageForInput(BenefitPolicy policy, ServiceCoverageInput input) {
        Long serviceId = input.getServiceId();
        String serviceName = input.getServiceName() != null ? input.getServiceName() : "Unknown Service";

        if (serviceId == null) {
            return ServiceCoverageResult.builder()
                .serviceId(null)
                .serviceName(serviceName)
                .covered(false)
                .reason("No service ID provided")
                .build();
        }

        MedicalService service = serviceRepository.findById(serviceId).orElse(null);
        if (service == null) {
            return ServiceCoverageResult.builder()
                .serviceId(serviceId)
                .serviceName(serviceName)
                .covered(false)
                .reason("Service not found in database")
                .build();
        }

        Long categoryId = (service.getCategoryEntity() != null) 
            ? service.getCategoryEntity().getId() 
            : null;

        Optional<BenefitPolicyRule> ruleOpt = ruleRepository.findBestRuleForService(
            policy.getId(), serviceId, categoryId);

        if (ruleOpt.isEmpty()) {
            return ServiceCoverageResult.builder()
                .serviceId(serviceId)
                .serviceName(service.getNameAr())
                .serviceCode(service.getCode())
                .categoryId(categoryId)
                .categoryName(service.getCategoryEntity() != null ? service.getCategoryEntity().getNameAr() : null)
                .covered(false)
                .reason("No coverage rule found for this service or category")
                .build();
        }

        BenefitPolicyRule rule = ruleOpt.get();

        return ServiceCoverageResult.builder()
            .serviceId(serviceId)
            .serviceName(service.getNameAr())
            .serviceCode(service.getCode())
            .categoryId(categoryId)
            .categoryName(service.getCategoryEntity() != null ? service.getCategoryEntity().getNameAr() : null)
            .covered(true)
            .coveragePercent(rule.getEffectiveCoveragePercent())
            .amountLimit(rule.getAmountLimit())
            .timesLimit(rule.getTimesLimit())
            .requiresPreApproval(rule.isRequiresPreApproval())
            .ruleId(rule.getId())
            .ruleType(rule.isCategoryRule() ? "CATEGORY" : "SERVICE")
            .build();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // QUICK CHECKS FOR CLAIM CREATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Quick validation before claim creation.
     * Throws BusinessRuleException if claim cannot be created.
     */
    public void validateCanCreateClaim(Member member, LocalDate serviceDate) {
        validateMemberHasActivePolicy(member, serviceDate);
    }

    /**
     * Get the effective coverage percentage for a service
     * Returns 0 if not covered
     */
    public int getCoveragePercentForService(Member member, Long serviceId) {
        return getCoverageForService(member, serviceId)
            .map(CoverageInfo::getCoveragePercent)
            .orElse(0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RESULT DTOs
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Coverage information for a single service
     */
    @Data
    @Builder
    public static class CoverageInfo {
        private boolean covered;
        private int coveragePercent;
        private BigDecimal amountLimit;
        private Integer timesLimit;
        private boolean requiresPreApproval;
        private Integer waitingPeriodDays;
        private Long ruleId;
        private String ruleType;
        private String serviceName;
        private String categoryName;
    }

    /**
     * Result of claim coverage validation
     */
    @Data
    @Builder
    public static class ClaimCoverageResult {
        private boolean valid;
        private Long policyId;
        private String policyName;
        private BigDecimal totalRequestedAmount;
        private BigDecimal totalCoveredAmount;
        private BigDecimal totalPatientAmount;
        private Integer defaultCoveragePercent;
        private List<ServiceCoverageResult> serviceResults;
        private List<String> errors;
        private List<String> warnings;

        public boolean hasWarnings() {
            return warnings != null && !warnings.isEmpty();
        }

        public String getErrorSummary() {
            if (errors == null || errors.isEmpty()) return null;
            return String.join("; ", errors);
        }
    }

    /**
     * Coverage result for a single service in a claim
     */
    @Data
    @Builder
    public static class ServiceCoverageResult {
        private Long serviceId;
        private String serviceName;
        private String serviceCode;
        private Long categoryId;
        private String categoryName;
        private boolean covered;
        private int coveragePercent;
        private BigDecimal amountLimit;
        private Integer timesLimit;
        private boolean requiresPreApproval;
        private Long ruleId;
        private String ruleType;
        private String reason; // Reason for not covered
    }

    /**
     * Input DTO for service coverage validation
     * Used to pass service details from ClaimLine or other sources
     */
    @Data
    @Builder
    public static class ServiceCoverageInput {
        private Long serviceId;
        private String serviceName;
        private BigDecimal amount;

        /**
         * Create from ClaimLine fields
         */
        public static ServiceCoverageInput fromClaimLine(Long serviceId, String description, BigDecimal totalPrice) {
            return ServiceCoverageInput.builder()
                .serviceId(serviceId)
                .serviceName(description)
                .amount(totalPrice)
                .build();
        }
    }
}
