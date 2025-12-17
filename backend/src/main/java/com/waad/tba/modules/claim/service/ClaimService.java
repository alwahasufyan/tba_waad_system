package com.waad.tba.modules.claim.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.modules.claim.dto.ClaimCreateDto;
import com.waad.tba.modules.claim.dto.ClaimUpdateDto;
import com.waad.tba.modules.claim.dto.ClaimViewDto;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.entity.ClaimStatus;
import com.waad.tba.modules.claim.mapper.ClaimMapper;
import com.waad.tba.modules.claim.repository.ClaimRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimMapper claimMapper;

    public List<ClaimViewDto> search(String query) {
        return claimRepository.search(query).stream()
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
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with id: " + id));
        return claimMapper.toViewDto(claim);
    }

    @Transactional(readOnly = true)
    public Page<ClaimViewDto> listClaims(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String keyword = (search != null && !search.trim().isEmpty()) ? search.trim() : "";
        
        Page<Claim> claimsPage = claimRepository.searchPaged(keyword, pageable);
        return claimsPage.map(claimMapper::toViewDto);
    }

    @Transactional(readOnly = true)
    public List<ClaimViewDto> getClaimsByMember(Long memberId) {
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
