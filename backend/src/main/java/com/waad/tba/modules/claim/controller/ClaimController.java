package com.waad.tba.modules.claim.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.common.dto.PaginationResponse;
import com.waad.tba.modules.claim.dto.ClaimCreateDto;
import com.waad.tba.modules.claim.dto.ClaimUpdateDto;
import com.waad.tba.modules.claim.dto.ClaimViewDto;
import com.waad.tba.modules.claim.service.ClaimService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_CLAIMS')")
    public ResponseEntity<ApiResponse<ClaimViewDto>> createClaim(@Valid @RequestBody ClaimCreateDto dto) {
        ClaimViewDto claim = claimService.createClaim(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Claim created successfully", claim));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CLAIMS')")
    public ResponseEntity<ApiResponse<ClaimViewDto>> updateClaim(
            @PathVariable Long id,
            @Valid @RequestBody ClaimUpdateDto dto) {
        ClaimViewDto claim = claimService.updateClaim(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Claim updated successfully", claim));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_CLAIMS')")
    public ResponseEntity<ApiResponse<ClaimViewDto>> getClaim(@PathVariable Long id) {
        ClaimViewDto claim = claimService.getClaim(id);
        return ResponseEntity.ok(ApiResponse.success("Claim retrieved successfully", claim));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_CLAIMS')")
    public ResponseEntity<ApiResponse<PaginationResponse<ClaimViewDto>>> listClaims(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<ClaimViewDto> claimsPage = claimService.listClaims(Math.max(0, page - 1), size, search);
        
        PaginationResponse<ClaimViewDto> response = PaginationResponse.<ClaimViewDto>builder()
                .items(claimsPage.getContent())
                .total(claimsPage.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CLAIMS')")
    public ResponseEntity<ApiResponse<Void>> deleteClaim(@PathVariable Long id) {
        claimService.deleteClaim(id);
        return ResponseEntity.ok(ApiResponse.success("Claim deleted successfully", null));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('VIEW_CLAIMS')")
    public ResponseEntity<ApiResponse<Long>> countClaims() {
        long count = claimService.countClaims();
        return ResponseEntity.ok(ApiResponse.success("Claims counted successfully", count));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_CLAIMS')")
    public ResponseEntity<ApiResponse<List<ClaimViewDto>>> search(@RequestParam String query) {
        List<ClaimViewDto> results = claimService.search(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAuthority('VIEW_CLAIMS')")
    public ResponseEntity<ApiResponse<List<ClaimViewDto>>> getClaimsByMember(@PathVariable Long memberId) {
        List<ClaimViewDto> claims = claimService.getClaimsByMember(memberId);
        return ResponseEntity.ok(ApiResponse.success("Member claims retrieved successfully", claims));
    }

    @GetMapping("/pre-approval/{preApprovalId}")
    @PreAuthorize("hasAuthority('VIEW_CLAIMS')")
    public ResponseEntity<ApiResponse<List<ClaimViewDto>>> getClaimsByPreApproval(@PathVariable Long preApprovalId) {
        List<ClaimViewDto> claims = claimService.getClaimsByPreApproval(preApprovalId);
        return ResponseEntity.ok(ApiResponse.success("Pre-approval claims retrieved successfully", claims));
    }
}
