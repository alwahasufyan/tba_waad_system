package com.waad.tba.modules.claim.service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.modules.claim.dto.ClaimCreateDto;
import com.waad.tba.modules.claim.dto.ClaimUpdateDto;
import com.waad.tba.modules.claim.dto.ClaimViewDto;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.entity.ClaimStatus;
import com.waad.tba.modules.claim.mapper.ClaimMapper;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.security.AuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimMapper claimMapper;
    private final AuthorizationService authorizationService;

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

    public ClaimViewDto createClaim(ClaimCreateDto dto) {
        validateCreateDto(dto);
        Claim claim = claimMapper.toEntity(dto);
        Claim savedClaim = claimRepository.save(claim);
        return claimMapper.toViewDto(savedClaim);
    }

    public ClaimViewDto updateClaim(Long id, ClaimUpdateDto dto) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with id: " + id));
        
        validateUpdateDto(dto, claim);
        claimMapper.updateEntityFromDto(claim, dto);
        Claim updatedClaim = claimRepository.save(claim);
        return claimMapper.toViewDto(updatedClaim);
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

        if (newStatus == ClaimStatus.APPROVED) {
            if (newApprovedAmount == null || newApprovedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Approved status requires approved amount greater than zero");
            }
        }

        if (newStatus == ClaimStatus.PARTIALLY_APPROVED) {
            if (newApprovedAmount == null || newApprovedAmount.compareTo(requestedAmount) >= 0) {
                throw new IllegalArgumentException("Partially approved status requires approved amount less than requested amount");
            }
        }

        if (newStatus == ClaimStatus.REJECTED) {
            if (newReviewerComment == null || newReviewerComment.trim().isEmpty()) {
                throw new IllegalArgumentException("Rejected status requires reviewer comment");
            }
        }
    }
}
