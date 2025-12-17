package com.waad.tba.modules.preauth.service;

import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.preauth.entity.*;
import com.waad.tba.modules.preauth.repository.*;
import com.waad.tba.modules.provider.entity.Provider;
import com.waad.tba.modules.provider.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Core service for Pre-Approval logic
 * Handles:
 * - Chronic condition approvals
 * - Exceed limit approvals
 * - Special VIP approvals
 * - Rule-based approval requirements
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PreApprovalService {

    private final PreApprovalRepository preApprovalRepository;
    private final PreApprovalRuleRepository ruleRepository;
    private final MemberChronicConditionRepository memberChronicRepository;
    private final ChronicConditionRepository chronicConditionRepository;
    private final MemberRepository memberRepository;
    private final ProviderRepository providerRepository;

    /**
     * Check if pre-approval is required for a service
     */
    @Transactional(readOnly = true)
    public PreApprovalRequirement checkIfApprovalRequired(
            Long memberId,
            String serviceCode,
            Long providerId,
            BigDecimal amount) {

        log.info("Checking pre-approval requirement for member: {}, service: {}, amount: {}",
                memberId, serviceCode, amount);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Check if provider is active
        if (!provider.getActive()) {
            PreApprovalRequirement requirement = new PreApprovalRequirement();
            requirement.setRequired(true);
            requirement.setAllowed(false);
            requirement.setReason("Provider is not active");
            requirement.setMemberId(memberId);
            requirement.setServiceCode(serviceCode);
            requirement.setProviderId(providerId);
            requirement.setAmount(amount);
            return requirement;
        }

        // Check if member has chronic conditions
        boolean hasChronic = memberChronicRepository.hasActiveChronicCondition(memberId);
        List<MemberChronicCondition> activeConditions = 
            memberChronicRepository.findActiveConditionsForMember(memberId, LocalDate.now());

        // Get matching rules
        List<PreApprovalRule> rules = ruleRepository.findMatchingRules(
            serviceCode, provider.getProviderType());

        PreApprovalRequirement requirement = new PreApprovalRequirement();
        requirement.setRequired(false);
        requirement.setMemberId(memberId);
        requirement.setServiceCode(serviceCode);
        requirement.setProviderId(providerId);
        requirement.setAmount(amount);

        // Check rules
        for (PreApprovalRule rule : rules) {
            if (rule.matchesCriteria(serviceCode, provider.getProviderType(), amount, hasChronic)) {
                requirement.setRequired(true);
                requirement.setReason("Matches rule: " + rule.getRuleName());
                requirement.setRequiredLevel(rule.getRequiredApprovalLevel());
                requirement.setAllowAutoApproval(rule.getAllowAutoApproval());
                
                // Check if can be auto-approved
                if (rule.getAllowAutoApproval() && 
                    rule.getMaxAutoApproveAmount() != null &&
                    amount.compareTo(rule.getMaxAutoApproveAmount()) <= 0) {
                    requirement.setCanAutoApprove(true);
                }
                
                break;
            }
        }

        // Check chronic condition mandatory approval
        for (MemberChronicCondition mcc : activeConditions) {
            if (mcc.getRequiresMandatoryPreApproval()) {
                requirement.setRequired(true);
                requirement.setReason("Member has chronic condition requiring mandatory approval: " + 
                    mcc.getChronicCondition().getName());
                requirement.setRequiredLevel(PreApproval.ApprovalLevel.MEDICAL);
                break;
            }
        }

        // Check if amount exceeds member balance
        BigDecimal remainingBalance = calculateMemberRemainingBalance(memberId);
        if (amount.compareTo(remainingBalance) > 0) {
            requirement.setRequired(true);
            requirement.setExceedLimit(true);
            requirement.setExceedAmount(amount.subtract(remainingBalance));
            requirement.setReason("Service cost exceeds member remaining balance");
            requirement.setRequiredLevel(PreApproval.ApprovalLevel.MANAGER);
        }

        return requirement;
    }

    /**
     * Create a pre-approval request
     */
    @Transactional
    public PreApproval createPreApproval(PreApprovalRequest request) {
        log.info("Creating pre-approval for member: {}, type: {}", 
            request.getMemberId(), request.getType());

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        Provider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Generate approval number
        String approvalNumber = generateApprovalNumber();

        PreApproval preApproval = PreApproval.builder()
                .approvalNumber(approvalNumber)
                .type(request.getType())
                .member(member)
                .providerId(request.getProviderId())
                .providerName(provider.getNameEnglish())
                .serviceCode(request.getServiceCode())
                .serviceDescription(request.getServiceDescription())
                .diagnosisCode(request.getDiagnosisCode())
                .diagnosisDescription(request.getDiagnosisDescription())
                .requestedAmount(request.getRequestedAmount())
                .memberRemainingBalance(calculateMemberRemainingBalance(member.getId()))
                .requestDate(LocalDate.now())
                .expectedServiceDate(request.getExpectedServiceDate())
                .requestReason(request.getRequestReason())
                .companyId(null) // Employer no longer has company relation
                .status(PreApproval.ApprovalStatus.PENDING)
                .build();

        // Calculate exceed amount if applicable
        if (request.getType() == PreApproval.ApprovalType.EXCEED_LIMIT) {
            BigDecimal exceedAmount = request.getRequestedAmount()
                .subtract(preApproval.getMemberRemainingBalance());
            preApproval.setExceedAmount(exceedAmount.max(BigDecimal.ZERO));
        }

        // Check if can be auto-approved
        PreApprovalRequirement requirement = checkIfApprovalRequired(
            request.getMemberId(), request.getServiceCode(), 
            request.getProviderId(), request.getRequestedAmount());

        if (requirement.isCanAutoApprove()) {
            preApproval.setAutoApproved(true);
            preApproval.setStatus(PreApproval.ApprovalStatus.APPROVED);
            preApproval.setApprovedAmount(request.getRequestedAmount());
            preApproval.setValidFrom(LocalDate.now());
            preApproval.setValidUntil(LocalDate.now().plusDays(30));
            preApproval.setAutoApprovalRule("Auto-approved based on system rules");
        } else {
            preApproval.setRequiredLevel(requirement.getRequiredLevel());
        }

        return preApprovalRepository.save(preApproval);
    }

    /**
     * Approve a pre-approval request
     */
    @Transactional
    public PreApproval approvePreApproval(Long approvalId, Long reviewerId, 
                                          BigDecimal approvedAmount, String notes) {
        log.info("Approving pre-approval: {}, reviewer: {}", approvalId, reviewerId);

        PreApproval preApproval = preApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new RuntimeException("Pre-approval not found"));

        if (preApproval.getStatus() != PreApproval.ApprovalStatus.PENDING &&
            preApproval.getStatus() != PreApproval.ApprovalStatus.UNDER_MEDICAL_REVIEW &&
            preApproval.getStatus() != PreApproval.ApprovalStatus.UNDER_MANAGER_REVIEW) {
            throw new RuntimeException("Pre-approval cannot be approved in current status: " + 
                preApproval.getStatus());
        }

        preApproval.setStatus(PreApproval.ApprovalStatus.APPROVED);
        preApproval.setApprovedAmount(approvedAmount);
        preApproval.setMedicalReviewNotes(notes);
        preApproval.setValidFrom(LocalDate.now());
        preApproval.setValidUntil(LocalDate.now().plusDays(30)); // Default 30 days validity

        return preApprovalRepository.save(preApproval);
    }

    /**
     * Reject a pre-approval request
     */
    @Transactional
    public PreApproval rejectPreApproval(Long approvalId, Long reviewerId, String reason) {
        log.info("Rejecting pre-approval: {}, reviewer: {}", approvalId, reviewerId);

        PreApproval preApproval = preApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new RuntimeException("Pre-approval not found"));

        preApproval.setStatus(PreApproval.ApprovalStatus.REJECTED);
        preApproval.setRejectionReason(reason);

        return preApprovalRepository.save(preApproval);
    }

    /**
     * Get valid approvals for a member
     */
    @Transactional(readOnly = true)
    public List<PreApproval> getValidApprovalsForMember(Long memberId) {
        return preApprovalRepository.findValidApprovalsForMember(memberId, LocalDate.now());
    }

    /**
     * Check if a member has a valid approval for a service
     */
    @Transactional(readOnly = true)
    public Optional<PreApproval> findValidApprovalForService(
            Long memberId, String serviceCode, BigDecimal amount) {
        
        List<PreApproval> validApprovals = getValidApprovalsForMember(memberId);
        
        return validApprovals.stream()
            .filter(pa -> pa.getServiceCode() != null && 
                         pa.getServiceCode().equals(serviceCode))
            .filter(pa -> pa.getApprovedAmount() != null && 
                         pa.getApprovedAmount().compareTo(amount) >= 0)
            .findFirst();
    }

    /**
     * Mark expired approvals
     */
    @Transactional
    public void markExpiredApprovals() {
        List<PreApproval> expired = preApprovalRepository.findExpiredApprovals(LocalDate.now());
        
        for (PreApproval pa : expired) {
            pa.setExpired(true);
            pa.setStatus(PreApproval.ApprovalStatus.EXPIRED);
        }
        
        preApprovalRepository.saveAll(expired);
        log.info("Marked {} approvals as expired", expired.size());
    }

    /**
     * Calculate member remaining balance
     * This is a simplified version - actual implementation should consider:
     * - Policy limits
     * - Used amounts from claims
     * - Extra limits from chronic conditions
     */
    private BigDecimal calculateMemberRemainingBalance(Long memberId) {
        // TODO: Implement actual balance calculation
        // For now, return a default value
        return BigDecimal.valueOf(10000);
    }

    /**
     * Generate unique approval number
     */
    private String generateApprovalNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = preApprovalRepository.count() + 1;
        return String.format("PA-%s-%06d", date, count);
    }

    // Inner classes for request/response
    @lombok.Data
    @lombok.Builder
    public static class PreApprovalRequest {
        private Long memberId;
        private Long providerId;
        private String serviceCode;
        private String serviceDescription;
        private String diagnosisCode;
        private String diagnosisDescription;
        private BigDecimal requestedAmount;
        private LocalDate expectedServiceDate;
        private String requestReason;
        private PreApproval.ApprovalType type;
    }

    @lombok.Data
    public static class PreApprovalRequirement {
        private boolean required;
        private boolean allowed;
        private Long memberId;
        private String serviceCode;
        private Long providerId;
        private BigDecimal amount;
        private String reason;
        private boolean exceedLimit;
        private BigDecimal exceedAmount;
        private PreApproval.ApprovalLevel requiredLevel;
        private boolean allowAutoApproval;
        private boolean canAutoApprove;
    }
}
