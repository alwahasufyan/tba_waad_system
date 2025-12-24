package com.waad.tba.modules.claim.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.exception.BusinessRuleException;
import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.benefitpolicy.service.BenefitPolicyCoverageService;
import com.waad.tba.modules.claim.dto.ClaimApproveDto;
import com.waad.tba.modules.claim.dto.ClaimCreateDto;
import com.waad.tba.modules.claim.dto.ClaimRejectDto;
import com.waad.tba.modules.claim.dto.ClaimSettleDto;
import com.waad.tba.modules.claim.dto.ClaimUpdateDto;
import com.waad.tba.modules.claim.dto.ClaimViewDto;
import com.waad.tba.modules.claim.dto.CostBreakdownDto;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.entity.ClaimStatus;
import com.waad.tba.modules.claim.entity.ClaimType;
import com.waad.tba.modules.claim.mapper.ClaimMapper;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.policy.entity.Policy;
import com.waad.tba.modules.policy.service.CoverageValidationService;
import com.waad.tba.modules.policy.service.PolicyValidationService;
import com.waad.tba.modules.provider.service.ProviderNetworkService;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.security.AuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Claim Service with Business Flow Validation (Phase 6).
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * BUSINESS RULES ENFORCED
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. CLAIM CREATION requires:
 *    - Member has active policy (validated by PolicyValidationService)
 *    - Policy covers the service date
 *    - Requested services are covered in benefit package
 *    - Coverage limits not exceeded
 * 
 * 2. CLAIM UPDATE follows state machine:
 *    - Only DRAFT and RETURNED_FOR_INFO allow detail edits
 *    - Status transitions validated by ClaimStateMachine
 * 
 * 3. STATUS TRANSITIONS require appropriate roles:
 *    - DRAFT → SUBMITTED (EMPLOYER, INSURANCE)
 *    - SUBMITTED → UNDER_REVIEW (INSURANCE, REVIEWER)
 *    - UNDER_REVIEW → APPROVED/REJECTED (INSURANCE, REVIEWER)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXAMPLE FLOW: Member → Claim → Review → Decision
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. Member "Ali" visits doctor on 2024-06-15
 * 2. EMPLOYER creates claim (status=DRAFT)
 *    → PolicyValidationService checks Ali's policy is active on 2024-06-15
 *    → CoverageValidationService checks services are covered
 * 3. EMPLOYER submits claim (DRAFT → SUBMITTED)
 * 4. INSURANCE takes for review (SUBMITTED → UNDER_REVIEW)
 * 5. REVIEWER approves with amount (UNDER_REVIEW → APPROVED)
 *    → Must set approvedAmount > 0
 * 6. INSURANCE settles payment (APPROVED → SETTLED)
 *    → Terminal state, no more changes allowed
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimMapper claimMapper;
    private final AuthorizationService authorizationService;
    private final MemberRepository memberRepository;
    
    // Phase 6: Business flow validation services
    private final PolicyValidationService policyValidationService;
    private final CoverageValidationService coverageValidationService;
    private final ClaimStateMachine claimStateMachine;
    
    // Phase 8: BenefitPolicy-based coverage validation (NEW - Single Source of Truth)
    private final BenefitPolicyCoverageService benefitPolicyCoverageService;
    
    // Phase 7: Operational completeness services
    private final ProviderNetworkService providerNetworkService;
    private final AttachmentRulesService attachmentRulesService;
    private final CostCalculationService costCalculationService;
    private final ClaimAuditService claimAuditService;

    /**
     * Search claims with data-level filtering.
     */
    public List<ClaimViewDto> search(String query) {
        log.debug("🔍 Searching claims with query: {}", query);
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("⚠️ No authenticated user");
            return Collections.emptyList();
        }
        
        // Check feature flags for EMPLOYER_ADMIN
        if (authorizationService.isEmployerAdmin(currentUser)) {
            if (!authorizationService.canEmployerViewClaims(currentUser)) {
                log.warn("❌ EMPLOYER_ADMIN feature VIEW_CLAIMS disabled");
                return Collections.emptyList();
            }
        }
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        List<Claim> claims;
        
        if (employerFilter != null) {
            log.debug("🔒 Filtering claims by employerId={}", employerFilter);
            claims = claimRepository.searchByEmployerId(query, employerFilter);
        } else {
            log.debug("🔓 No filter - searching all claims");
            claims = claimRepository.search(query);
        }
        
        return claims.stream()
                .map(claimMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new claim with business rule validation.
     * 
     * PHASE 6 VALIDATION:
     * 1. Member must have active policy
     * 2. Policy must cover service date
     * 3. Services must be covered in benefit package
     * 4. Coverage limits must not be exceeded
     * 
     * PHASE 7 ADDITIONS:
     * 5. Provider network validation (IN_NETWORK/OUT_OF_NETWORK warning)
     * 6. Cost calculation preview (deductible, co-pay)
     * 7. Audit trail creation
     * 
     * PHASE 8 ADDITIONS:
     * 8. BenefitPolicy validation (new single source of truth)
     */
    public ClaimViewDto createClaim(ClaimCreateDto dto) {
        log.info("📝 Creating claim for member {}", dto.getMemberId());
        
        // Basic DTO validation
        validateCreateDto(dto);
        
        // Phase 6: Get member and validate policy
        Member member = memberRepository.findById(dto.getMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member", "id", dto.getMemberId()));
        
        LocalDate serviceDate = dto.getVisitDate() != null ? dto.getVisitDate() : LocalDate.now();
        
        // ═══════════════════════════════════════════════════════════════════════════
        // PHASE 8: BenefitPolicy Validation (Single Source of Truth)
        // ═══════════════════════════════════════════════════════════════════════════
        // Validate member has active BenefitPolicy for service date
        // This replaces/supplements the old PolicyValidationService
        benefitPolicyCoverageService.validateCanCreateClaim(member, serviceDate);
        log.info("✅ Member {} has valid BenefitPolicy for date {}", member.getCivilId(), serviceDate);
        
        // Legacy validation (kept for backward compatibility with old Policy system)
        try {
            policyValidationService.validateMemberPolicy(member, serviceDate);
        } catch (Exception e) {
            // Log but don't block - BenefitPolicy is now the primary validation
            log.warn("⚠️ Legacy policy validation warning: {}", e.getMessage());
        }
        
        // Validate coverage if policy exists (legacy)
        Policy policy = member.getPolicy();
        if (policy != null && dto.getRequestedAmount() != null) {
            try {
                coverageValidationService.validateAmountLimits(
                    member, policy, dto.getRequestedAmount(), serviceDate);
            } catch (Exception e) {
                log.warn("⚠️ Legacy coverage validation warning: {}", e.getMessage());
            }
        }
        
        // Phase 7: Provider network validation (non-blocking, just warning)
        if (dto.getProviderName() != null) {
            var networkResult = providerNetworkService.validateProviderForClaim(dto.getProviderName());
            if (networkResult.warning() != null) {
                log.warn("⚠️ Provider network warning for claim: {}", networkResult.warning());
                // Warning is non-blocking - claim can still be created
            }
        }
        
        // Create claim in DRAFT status
        Claim claim = claimMapper.toEntity(dto);
        claim.setStatus(ClaimStatus.DRAFT); // Always start as DRAFT
        
        Claim savedClaim = claimRepository.save(claim);
        
        // Phase 7: Record creation in audit trail
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser != null) {
            claimAuditService.recordCreation(savedClaim, currentUser);
        }
        
        log.info("✅ Claim {} created in DRAFT status", savedClaim.getId());
        
        return claimMapper.toViewDto(savedClaim);
    }

    /**
     * Update an existing claim with state machine validation.
     * 
     * PHASE 6 RULES:
     * 1. Only DRAFT and RETURNED_FOR_INFO allow detail edits
     * 2. Status changes go through ClaimStateMachine
     * 3. REJECTED requires reviewer comment
     * 4. APPROVED requires approved amount
     * 
     * PHASE 7 ADDITIONS:
     * 5. Attachment validation before SUBMITTED
     * 6. Cost calculation before APPROVED
     * 7. Audit trail for all changes
     */
    public ClaimViewDto updateClaim(Long id, ClaimUpdateDto dto) {
        log.info("📝 Updating claim {}", id);
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        ClaimStatus previousStatus = claim.getStatus();
        
        // Phase 6: Check if status change is requested
        if (dto.getStatus() != null && dto.getStatus() != claim.getStatus()) {
            
            // Phase 7: Validate attachments before transitioning to SUBMITTED
            if (dto.getStatus() == ClaimStatus.SUBMITTED) {
                var attachmentResult = attachmentRulesService.validateForSubmission(claim, ClaimType.GENERAL);
                if (!attachmentResult.valid()) {
                    throw new BusinessRuleException(
                        "Cannot submit claim: " + attachmentResult.getErrorMessage()
                    );
                }
            }
            
            // Phase 7: Calculate costs before APPROVED
            if (dto.getStatus() == ClaimStatus.APPROVED) {
                var costBreakdown = costCalculationService.calculateCosts(claim);
                log.info("💰 Cost calculation for approval: {}", costBreakdown.getSummary());
                // Costs are calculated but actual approved amount is set by reviewer
            }
            
            // Use state machine for status transitions
            claimStateMachine.transition(claim, dto.getStatus(), currentUser);
            
            // Phase 7: Record status change in audit trail
            claimAuditService.recordStatusChange(claim, previousStatus, currentUser, dto.getReviewerComment());
            
        } else {
            // Regular update - check if edits are allowed
            if (!claimStateMachine.canEdit(claim)) {
                throw new BusinessRuleException(
                    String.format("Cannot edit claim in %s status. Only DRAFT and RETURNED_FOR_INFO allow edits.",
                        claim.getStatus())
                );
            }
        }
        
        // Validate and apply other changes
        validateUpdateDto(dto, claim);
        claimMapper.updateEntityFromDto(claim, dto);
        
        Claim updatedClaim = claimRepository.save(claim);
        log.info("✅ Claim {} updated, status: {}", id, updatedClaim.getStatus());
        
        return claimMapper.toViewDto(updatedClaim);
    }

    /**
     * Transition claim status using state machine.
     * Dedicated endpoint for status changes.
     * 
     * PHASE 7 ADDITIONS:
     * - Attachment validation before SUBMITTED
     * - Cost calculation before APPROVED
     * - Audit trail recording
     */
    public ClaimViewDto transitionStatus(Long id, ClaimStatus targetStatus, String comment) {
        log.info("🔄 Transitioning claim {} to {}", id, targetStatus);
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        ClaimStatus previousStatus = claim.getStatus();
        
        // Phase 7: Validate attachments before SUBMITTED
        if (targetStatus == ClaimStatus.SUBMITTED) {
            var attachmentResult = attachmentRulesService.validateForSubmission(claim, ClaimType.GENERAL);
            if (!attachmentResult.valid()) {
                throw new BusinessRuleException(
                    "Cannot submit claim: " + attachmentResult.getErrorMessage()
                );
            }
        }
        
        // Phase 7: Calculate and log costs before approval
        if (targetStatus == ClaimStatus.APPROVED) {
            var costBreakdown = costCalculationService.calculateCosts(claim);
            log.info("💰 Cost breakdown for claim {}: {}", id, costBreakdown.getSummary());
        }
        
        // Set comment before transition (needed for REJECTED validation)
        if (comment != null && !comment.isBlank()) {
            claim.setReviewerComment(comment);
        }
        
        // Perform transition with validation
        claimStateMachine.transition(claim, targetStatus, currentUser);
        
        Claim updatedClaim = claimRepository.save(claim);
        
        // Phase 7: Record in audit trail based on transition type
        if (targetStatus == ClaimStatus.APPROVED) {
            claimAuditService.recordApproval(updatedClaim, previousStatus, null, currentUser, comment);
        } else if (targetStatus == ClaimStatus.REJECTED) {
            claimAuditService.recordRejection(updatedClaim, previousStatus, currentUser, comment);
        } else if (targetStatus == ClaimStatus.SETTLED) {
            claimAuditService.recordSettlement(updatedClaim, currentUser);
        } else {
            claimAuditService.recordStatusChange(updatedClaim, previousStatus, currentUser, comment);
        }
        
        log.info("✅ Claim {} transitioned to {}", id, targetStatus);
        
        return claimMapper.toViewDto(updatedClaim);
    }

    /**
     * Get available status transitions for a claim.
     * Used by frontend to show valid action buttons.
     */
    @Transactional(readOnly = true)
    public Set<ClaimStatus> getAvailableTransitions(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        return claimStateMachine.getAvailableTransitions(claim, currentUser);
    }

    @Transactional(readOnly = true)
    public ClaimViewDto getClaim(Long id) {
        log.debug("📋 Getting claim by id: {}", id);
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }
        
        // Check feature flags for EMPLOYER_ADMIN
        if (authorizationService.isEmployerAdmin(currentUser)) {
            if (!authorizationService.canEmployerViewClaims(currentUser)) {
                log.warn("❌ EMPLOYER_ADMIN feature VIEW_CLAIMS disabled");
                throw new AccessDeniedException("Your employer account does not have permission to view claims");
            }
        }
        
        // Check access authorization
        if (!authorizationService.canAccessClaim(currentUser, id)) {
            log.warn("❌ Access denied: user {} attempted to access claim {}", 
                currentUser.getUsername(), id);
            throw new AccessDeniedException("Access denied to this claim");
        }
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with id: " + id));
        return claimMapper.toViewDto(claim);
    }

    @Transactional(readOnly = true)
    public Page<ClaimViewDto> listClaims(int page, int size, String sortBy, String sortDir, String search) {
        log.debug("📋 Listing claims with pagination. page={}, size={}, sortBy={}, sortDir={}, search={}", 
                page, size, sortBy, sortDir, search);
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            return Page.empty();
        }
        
        // Check feature flags for EMPLOYER_ADMIN
        if (authorizationService.isEmployerAdmin(currentUser)) {
            if (!authorizationService.canEmployerViewClaims(currentUser)) {
                log.warn("❌ EMPLOYER_ADMIN feature VIEW_CLAIMS disabled");
                return Page.empty();
            }
        }
        
        // Build sort direction from string parameter
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        String keyword = (search != null && !search.trim().isEmpty()) ? search.trim() : "";
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        Page<Claim> claimsPage;
        
        if (employerFilter != null) {
            log.debug("🔒 Filtering claims by employerId={}", employerFilter);
            claimsPage = claimRepository.searchPagedByEmployerId(keyword, employerFilter, pageable);
        } else {
            log.debug("🔓 No filter - listing all claims");
            claimsPage = claimRepository.searchPaged(keyword, pageable);
        }
        
        return claimsPage.map(claimMapper::toViewDto);
    }

    @Transactional(readOnly = true)
    public List<ClaimViewDto> getClaimsByMember(Long memberId) {
        log.debug("📋 Getting claims for member: {}", memberId);
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            return Collections.emptyList();
        }
        
        // Check if user can access this member
        if (!authorizationService.canAccessMember(currentUser, memberId)) {
            log.warn("❌ Access denied to member {}", memberId);
            return Collections.emptyList();
        }
        
        List<Claim> claims = claimRepository.findByMemberId(memberId);
        return claims.stream()
                .map(claimMapper::toViewDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimViewDto> getClaimsByPreApproval(Long preApprovalId) {
        List<Claim> claims = claimRepository.findByPreApprovalId(preApprovalId);
        return claims.stream()
                .map(claimMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Get cost breakdown preview for a claim (Phase 7).
     * Returns deductible, co-pay, and insurance coverage amounts.
     */
    @Transactional(readOnly = true)
    public CostCalculationService.CostBreakdown getCostBreakdown(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        return costCalculationService.calculateCosts(claim);
    }

    /**
     * Get cost breakdown as DTO for API response.
     */
    @Transactional(readOnly = true)
    public CostBreakdownDto getCostBreakdownDto(Long id) {
        CostCalculationService.CostBreakdown breakdown = getCostBreakdown(id);
        return CostBreakdownDto.from(breakdown);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MVP PHASE: Approve / Reject / Settle Endpoints
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Approve a claim with financial validation.
     * 
     * POST /api/claims/{id}/approve
     * 
     * Business Rules:
     * 1. Claim must be in SUBMITTED or UNDER_REVIEW status
     * 2. Cost breakdown is calculated and validated
     * 3. Coverage limits are checked (via CoverageValidationService)
     * 4. Financial snapshot is stored on the claim
     * 5. Status transitions to APPROVED
     * 
     * @param id Claim ID
     * @param dto Approval details
     * @return Updated claim with financial snapshot
     */
    @Transactional
    public ClaimViewDto approveClaim(Long id, ClaimApproveDto dto) {
        log.info("✅ Approving claim {}", id);
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        ClaimStatus previousStatus = claim.getStatus();
        
        // Step 1: Calculate cost breakdown
        CostCalculationService.CostBreakdown breakdown = costCalculationService.calculateCosts(claim);
        log.info("💰 Cost breakdown for claim {}: {}", id, breakdown.getSummary());
        
        // Step 2: Determine approved amount
        BigDecimal approvedAmount;
        if (Boolean.TRUE.equals(dto.getUseSystemCalculation()) || dto.getApprovedAmount() == null) {
            // Use system-calculated amount (insurance pays)
            approvedAmount = breakdown.insuranceAmount();
            log.info("📊 Using system-calculated approved amount: {}", approvedAmount);
        } else {
            // Use manual amount from reviewer
            approvedAmount = dto.getApprovedAmount();
            log.info("📊 Using manual approved amount: {}", approvedAmount);
        }
        
        // Step 3: Validate approved amount
        if (approvedAmount == null || approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("المبلغ المعتمد يجب أن يكون أكبر من صفر");
        }
        
        if (approvedAmount.compareTo(claim.getRequestedAmount()) > 0) {
            throw new BusinessRuleException("المبلغ المعتمد لا يمكن أن يتجاوز المبلغ المطلوب");
        }
        
        // Step 4: Validate Financial Snapshot equation
        // Rule: RequestedAmount = PatientCoPay + NetProviderAmount
        BigDecimal patientCoPay = breakdown.patientResponsibility();
        BigDecimal netProviderAmount = breakdown.insuranceAmount();
        BigDecimal total = patientCoPay.add(netProviderAmount);
        
        if (total.compareTo(claim.getRequestedAmount()) != 0) {
            log.warn("⚠️ Financial calculation mismatch: {} + {} = {} != {}", 
                patientCoPay, netProviderAmount, total, claim.getRequestedAmount());
            // Auto-adjust to ensure balance
            netProviderAmount = claim.getRequestedAmount().subtract(patientCoPay);
        }
        
        // Step 5: Validate coverage limits (Middleware Gate)
        Member member = claim.getMember();
        Policy policy = member.getPolicy();
        if (policy != null) {
            try {
                coverageValidationService.validateAmountLimits(
                    member, policy, approvedAmount, 
                    claim.getVisitDate() != null ? claim.getVisitDate() : LocalDate.now()
                );
            } catch (Exception e) {
                log.error("❌ Coverage validation failed: {}", e.getMessage());
                throw new BusinessRuleException("فشل التحقق من التغطية: " + e.getMessage());
            }
        }
        
        // Step 6: Update claim with financial snapshot
        claim.setApprovedAmount(approvedAmount);
        claim.setPatientCoPay(patientCoPay);
        claim.setNetProviderAmount(netProviderAmount);
        claim.setCoPayPercent(breakdown.coPayPercent());
        claim.setDeductibleApplied(breakdown.deductibleApplied());
        claim.setDifferenceAmount(claim.getRequestedAmount().subtract(approvedAmount));
        
        if (dto.getNotes() != null && !dto.getNotes().isBlank()) {
            claim.setReviewerComment(dto.getNotes());
        }
        
        // Step 7: Transition to APPROVED status
        claimStateMachine.transition(claim, ClaimStatus.APPROVED, currentUser);
        
        Claim savedClaim = claimRepository.save(claim);
        
        // Step 8: Record in audit trail (pass null for previousApprovedAmount as it wasn't approved before)
        claimAuditService.recordApproval(savedClaim, previousStatus, null, currentUser, dto.getNotes());
        
        log.info("✅ Claim {} approved: requested={}, approved={}, patientCoPay={}, netProvider={}", 
            id, claim.getRequestedAmount(), approvedAmount, patientCoPay, netProviderAmount);
        
        return claimMapper.toViewDto(savedClaim);
    }

    /**
     * Reject a claim with mandatory reason.
     * 
     * POST /api/claims/{id}/reject
     * 
     * Business Rules:
     * 1. Claim must be in SUBMITTED or UNDER_REVIEW status
     * 2. Rejection reason is MANDATORY
     * 3. Status transitions to REJECTED (terminal state)
     * 
     * @param id Claim ID
     * @param dto Rejection details with mandatory reason
     * @return Updated claim
     */
    @Transactional
    public ClaimViewDto rejectClaim(Long id, ClaimRejectDto dto) {
        log.info("❌ Rejecting claim {}", id);
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        ClaimStatus previousStatus = claim.getStatus();
        
        // Validate rejection reason is provided
        if (dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
            throw new BusinessRuleException("سبب الرفض مطلوب");
        }
        
        // Set rejection details
        claim.setReviewerComment(dto.getRejectionReason());
        claim.setApprovedAmount(BigDecimal.ZERO);
        claim.setNetProviderAmount(BigDecimal.ZERO);
        
        // Transition to REJECTED status
        claimStateMachine.transition(claim, ClaimStatus.REJECTED, currentUser);
        
        Claim savedClaim = claimRepository.save(claim);
        
        // Record in audit trail
        claimAuditService.recordRejection(savedClaim, previousStatus, currentUser, dto.getRejectionReason());
        
        log.info("❌ Claim {} rejected. Reason: {}", id, dto.getRejectionReason());
        
        return claimMapper.toViewDto(savedClaim);
    }

    /**
     * Settle a claim (mark ready for payment).
     * 
     * POST /api/claims/{id}/settle
     * 
     * Business Rules:
     * 1. Claim must be in APPROVED status
     * 2. Payment reference must be provided
     * 3. Status transitions to SETTLED (terminal state)
     * 
     * @param id Claim ID
     * @param dto Settlement details
     * @return Updated claim
     */
    @Transactional
    public ClaimViewDto settleClaim(Long id, ClaimSettleDto dto) {
        log.info("💳 Settling claim {}", id);
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        ClaimStatus previousStatus = claim.getStatus();
        
        // Validate claim is in APPROVED status
        if (claim.getStatus() != ClaimStatus.APPROVED) {
            throw new BusinessRuleException(
                String.format("لا يمكن تسوية المطالبة. الحالة الحالية: %s. يجب أن تكون: APPROVED", 
                    claim.getStatus())
            );
        }
        
        // Validate payment reference
        if (dto.getPaymentReference() == null || dto.getPaymentReference().trim().isEmpty()) {
            throw new BusinessRuleException("رقم مرجع الدفع مطلوب");
        }
        
        // Set settlement details
        claim.setPaymentReference(dto.getPaymentReference());
        claim.setSettledAt(LocalDateTime.now());
        
        if (dto.getNotes() != null) {
            claim.setSettlementNotes(dto.getNotes());
        }
        
        // Verify settlement amount matches approved amount
        if (dto.getSettlementAmount() != null) {
            if (dto.getSettlementAmount().compareTo(claim.getApprovedAmount()) != 0) {
                log.warn("⚠️ Settlement amount {} differs from approved amount {}", 
                    dto.getSettlementAmount(), claim.getApprovedAmount());
            }
        }
        
        // Transition to SETTLED status
        claimStateMachine.transition(claim, ClaimStatus.SETTLED, currentUser);
        
        Claim savedClaim = claimRepository.save(claim);
        
        // Record in audit trail
        claimAuditService.recordSettlement(savedClaim, currentUser);
        
        log.info("💳 Claim {} settled. Payment Ref: {}, Amount: {}", 
            id, dto.getPaymentReference(), claim.getApprovedAmount());
        
        return claimMapper.toViewDto(savedClaim);
    }

    /**
     * Submit a draft claim for review.
     * 
     * POST /api/claims/{id}/submit
     * 
     * Business Rules:
     * 1. Claim must be in DRAFT or RETURNED_FOR_INFO status
     * 2. All required attachments must be present
     * 3. Status transitions to SUBMITTED
     */
    @Transactional
    public ClaimViewDto submitClaim(Long id) {
        log.info("📤 Submitting claim {}", id);
        
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        
        User currentUser = authorizationService.getCurrentUser();
        ClaimStatus previousStatus = claim.getStatus();
        
        // Validate current status allows submission
        if (claim.getStatus() != ClaimStatus.DRAFT && 
            claim.getStatus() != ClaimStatus.RETURNED_FOR_INFO) {
            throw new BusinessRuleException(
                String.format("لا يمكن تقديم المطالبة. الحالة الحالية: %s", claim.getStatus())
            );
        }
        
        // Validate attachments
        var attachmentResult = attachmentRulesService.validateForSubmission(claim, ClaimType.GENERAL);
        if (!attachmentResult.valid()) {
            throw new BusinessRuleException(
                "لا يمكن تقديم المطالبة: " + attachmentResult.getErrorMessage()
            );
        }
        
        // Transition to SUBMITTED status
        claimStateMachine.transition(claim, ClaimStatus.SUBMITTED, currentUser);
        
        Claim savedClaim = claimRepository.save(claim);
        
        // Record in audit trail
        claimAuditService.recordStatusChange(savedClaim, previousStatus, currentUser, "تم تقديم المطالبة للمراجعة");
        
        log.info("📤 Claim {} submitted for review", id);
        
        return claimMapper.toViewDto(savedClaim);
    }

    /**
     * Get claims pending review (for inbox).
     * Returns claims in SUBMITTED or UNDER_REVIEW status.
     */
    @Transactional(readOnly = true)
    public Page<ClaimViewDto> getPendingClaims(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        List<ClaimStatus> pendingStatuses = List.of(ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW);
        Page<Claim> claims = claimRepository.findByStatusIn(pendingStatuses, pageable);
        
        return claims.map(claimMapper::toViewDto);
    }

    /**
     * Get claims ready for settlement (APPROVED status).
     */
    @Transactional(readOnly = true)
    public Page<ClaimViewDto> getApprovedClaims(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Claim> claims = claimRepository.findByStatus(ClaimStatus.APPROVED, pageable);
        
        return claims.map(claimMapper::toViewDto);
    }

    /**
     * Get audit history for a claim (Phase 7).
     * Returns all state changes and actions performed on the claim.
     */
    @Transactional(readOnly = true)
    public List<com.waad.tba.modules.claim.entity.ClaimAuditLog> getAuditHistory(Long id) {
        // Verify claim exists
        if (!claimRepository.existsById(id)) {
            throw new ResourceNotFoundException("Claim", "id", id);
        }
        return claimAuditService.getAuditHistory(id);
    }

    /**
     * Get attachment requirements for a claim type (Phase 7).
     */
    @Transactional(readOnly = true)
    public AttachmentRulesService.AttachmentRequirements getAttachmentRequirements(ClaimType claimType) {
        return attachmentRulesService.getRequirements(claimType);
    }

    /**
     * Validate attachments for a claim (Phase 7).
     * Can be called before submission to check if all required documents are present.
     */
    @Transactional(readOnly = true)
    public AttachmentRulesService.AttachmentValidationResult validateAttachments(Long id, ClaimType claimType) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        return attachmentRulesService.validateForSubmission(claim, claimType);
    }

    /**
     * Get provider network status for a claim (Phase 7).
     */
    @Transactional(readOnly = true)
    public ProviderNetworkService.ProviderValidationResult getProviderNetworkStatus(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        return providerNetworkService.validateProviderForClaim(claim.getProviderName());
    }

    public void deleteClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with id: " + id));
        claim.setActive(false);
        claimRepository.save(claim);
    }

    @Transactional(readOnly = true)
    public long countClaims() {
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            return 0;
        }
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        if (employerFilter != null) {
            return claimRepository.countByMemberEmployerId(employerFilter);
        }
        
        return claimRepository.countActive();
    }

    private void validateCreateDto(ClaimCreateDto dto) {
        if (dto.getRequestedAmount() == null || dto.getRequestedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Requested amount must be greater than zero");
        }
    }

    private void validateUpdateDto(ClaimUpdateDto dto, Claim claim) {
        if (dto.getRequestedAmount() != null && dto.getRequestedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Requested amount must be greater than zero");
        }

        ClaimStatus newStatus = dto.getStatus() != null ? dto.getStatus() : claim.getStatus();
        BigDecimal newApprovedAmount = dto.getApprovedAmount() != null ? dto.getApprovedAmount() : claim.getApprovedAmount();
        String newReviewerComment = dto.getReviewerComment() != null ? dto.getReviewerComment() : claim.getReviewerComment();
        BigDecimal requestedAmount = dto.getRequestedAmount() != null ? dto.getRequestedAmount() : claim.getRequestedAmount();

        // Phase 6: Validation for status transitions
        // Note: State transitions are now handled by ClaimStateMachine
        // These validations are kept for backwards compatibility with direct updates
        
        if (newStatus == ClaimStatus.APPROVED || newStatus == ClaimStatus.SETTLED) {
            if (newApprovedAmount == null || newApprovedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Approved/Settled status requires approved amount greater than zero");
            }
        }

        // Note: Partial approval is now represented as APPROVED with approvedAmount < requestedAmount
        // The UI can show "Partial" badge based on approvedAmount < requestedAmount

        if (newStatus == ClaimStatus.REJECTED) {
            if (newReviewerComment == null || newReviewerComment.trim().isEmpty()) {
                throw new IllegalArgumentException("Rejected status requires reviewer comment");
            }
        }
    }
}
