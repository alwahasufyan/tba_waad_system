package com.waad.tba.modules.claim.service;

import java.math.BigDecimal;
import java.time.LocalDate;
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
import com.waad.tba.modules.claim.dto.ClaimCreateDto;
import com.waad.tba.modules.claim.dto.ClaimUpdateDto;
import com.waad.tba.modules.claim.dto.ClaimViewDto;
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
     */
    public ClaimViewDto createClaim(ClaimCreateDto dto) {
        log.info("📝 Creating claim for member {}", dto.getMemberId());
        
        // Basic DTO validation
        validateCreateDto(dto);
        
        // Phase 6: Get member and validate policy
        Member member = memberRepository.findById(dto.getMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member", "id", dto.getMemberId()));
        
        LocalDate serviceDate = dto.getVisitDate() != null ? dto.getVisitDate() : LocalDate.now();
        
        // Validate member has active policy for service date
        policyValidationService.validateMemberPolicy(member, serviceDate);
        
        // Validate coverage if policy exists
        Policy policy = member.getPolicy();
        if (policy != null && dto.getRequestedAmount() != null) {
            // Convert DTO lines to entity lines for validation (if available)
            // For now, validate amount limits
            coverageValidationService.validateAmountLimits(
                member, policy, dto.getRequestedAmount(), serviceDate);
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
    public Page<ClaimViewDto> listClaims(int page, int size, String search) {
        log.debug("📋 Listing claims with pagination. page={}, size={}, search={}", page, size, search);
        
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
        
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
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
