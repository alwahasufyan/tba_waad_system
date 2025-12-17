package com.waad.tba.modules.preauth.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.preauth.dto.PreApprovalApproveDto;
import com.waad.tba.modules.preauth.dto.PreApprovalCheckRequestDto;
import com.waad.tba.modules.preauth.dto.PreApprovalCheckResponseDto;
import com.waad.tba.modules.preauth.dto.PreApprovalRejectDto;
import com.waad.tba.modules.preauth.dto.PreApprovalRequestDto;
import com.waad.tba.modules.preauth.dto.PreApprovalResponseDto;
import com.waad.tba.modules.preauth.entity.PreApproval;
import com.waad.tba.modules.preauth.service.PreApprovalService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pre-approvals")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pre-Approvals", description = "Pre-Approval Management APIs")
public class PreApprovalController {

    private final PreApprovalService preApprovalService;

    /**
     * Check if pre-approval is required for a service
     */
    @PostMapping("/check")
    @Operation(
        summary = "Check if pre-approval is required", 
        description = "Check if pre-approval is required for a specific service and member. Provider must have an active contract with the member's company."
    )
    public ResponseEntity<ApiResponse<PreApprovalCheckResponseDto>> checkApprovalRequired(
            @Valid @RequestBody PreApprovalCheckRequestDto request) {
        
        log.info("Checking pre-approval requirement for member: {}, service: {}", 
            request.getMemberId(), request.getServiceCode());

        PreApprovalService.PreApprovalRequirement requirement = 
            preApprovalService.checkIfApprovalRequired(
                request.getMemberId(),
                request.getServiceCode(),
                request.getProviderId(),
                request.getAmount()
            );

        // Check if there's already a valid approval
        Optional<PreApproval> validApproval = preApprovalService.findValidApprovalForService(
            request.getMemberId(), request.getServiceCode(), request.getAmount());

        PreApprovalCheckResponseDto response = PreApprovalCheckResponseDto.builder()
            .required(requirement.isRequired())
            .reason(requirement.getReason())
            .exceedLimit(requirement.isExceedLimit())
            .exceedAmount(requirement.getExceedAmount())
            .requiredLevel(requirement.getRequiredLevel())
            .allowAutoApproval(requirement.isAllowAutoApproval())
            .canAutoApprove(requirement.isCanAutoApprove())
            .hasValidApproval(validApproval.isPresent())
            .validApprovalNumber(validApproval.map(PreApproval::getApprovalNumber).orElse(null))
            .approvedAmount(validApproval.map(PreApproval::getApprovedAmount).orElse(null))
            .build();

        return ResponseEntity.ok(ApiResponse.success(
            "Pre-approval requirement check completed", response));
    }

    /**
     * Create a new pre-approval request
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_PRE_APPROVAL', 'PROVIDER_STAFF', 'TPA_STAFF')")
    @Operation(summary = "Create pre-approval request", 
               description = "Create a new pre-approval request")
    public ResponseEntity<ApiResponse<PreApprovalResponseDto>> createPreApproval(
            @Valid @RequestBody PreApprovalRequestDto request) {
        
        log.info("Creating pre-approval for member: {}, type: {}", 
            request.getMemberId(), request.getType());

        PreApprovalService.PreApprovalRequest serviceRequest = 
            PreApprovalService.PreApprovalRequest.builder()
                .memberId(request.getMemberId())
                .providerId(request.getProviderId())
                .serviceCode(request.getServiceCode())
                .serviceDescription(request.getServiceDescription())
                .diagnosisCode(request.getDiagnosisCode())
                .diagnosisDescription(request.getDiagnosisDescription())
                .requestedAmount(request.getRequestedAmount())
                .expectedServiceDate(request.getExpectedServiceDate())
                .requestReason(request.getRequestReason())
                .type(request.getType())
                .build();

        PreApproval preApproval = preApprovalService.createPreApproval(serviceRequest);

        PreApprovalResponseDto response = mapToDto(preApproval);

        return ResponseEntity.ok(ApiResponse.success(
            "Pre-approval created successfully", response));
    }

    /**
     * Get pre-approval by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_PRE_APPROVAL', 'PROVIDER_STAFF', 'TPA_STAFF')")
    @Operation(summary = "Get pre-approval by ID")
    public ResponseEntity<ApiResponse<PreApprovalResponseDto>> getPreApprovalById(
            @PathVariable Long id) {
        
        // TODO: Implement proper service method
        return ResponseEntity.ok(ApiResponse.success("Pre-approval retrieved", null));
    }

    /**
     * Get pre-approval by approval number
     */
    @GetMapping("/number/{approvalNumber}")
    @PreAuthorize("hasAnyAuthority('VIEW_PRE_APPROVAL', 'PROVIDER_STAFF', 'TPA_STAFF')")
    @Operation(summary = "Get pre-approval by approval number")
    public ResponseEntity<ApiResponse<PreApprovalResponseDto>> getByApprovalNumber(
            @PathVariable String approvalNumber) {
        
        // TODO: Implement proper service method
        return ResponseEntity.ok(ApiResponse.success("Pre-approval retrieved", null));
    }

    /**
     * Get all pre-approvals for a member
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyAuthority('VIEW_PRE_APPROVAL', 'PROVIDER_STAFF', 'TPA_STAFF')")
    @Operation(summary = "Get all pre-approvals for a member")
    public ResponseEntity<ApiResponse<List<PreApprovalResponseDto>>> getByMember(
            @PathVariable Long memberId) {
        
        // TODO: Implement proper service method
        return ResponseEntity.ok(ApiResponse.success("Pre-approvals retrieved", null));
    }

    /**
     * Get valid pre-approvals for a member
     */
    @GetMapping("/member/{memberId}/valid")
    @PreAuthorize("hasAnyAuthority('VIEW_PRE_APPROVAL', 'PROVIDER_STAFF', 'TPA_STAFF')")
    @Operation(summary = "Get valid pre-approvals for a member")
    public ResponseEntity<ApiResponse<List<PreApprovalResponseDto>>> getValidApprovals(
            @PathVariable Long memberId) {
        
        List<PreApproval> validApprovals = preApprovalService.getValidApprovalsForMember(memberId);
        List<PreApprovalResponseDto> response = validApprovals.stream()
            .map(this::mapToDto)
            .toList();

        return ResponseEntity.ok(ApiResponse.success(
            "Valid pre-approvals retrieved", response));
    }

    /**
     * Approve a pre-approval request
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('APPROVE_PRE_APPROVAL', 'MEDICAL_REVIEWER', 'TPA_MANAGER')")
    @Operation(summary = "Approve pre-approval request")
    public ResponseEntity<ApiResponse<PreApprovalResponseDto>> approvePreApproval(
            @PathVariable Long id,
            @Valid @RequestBody PreApprovalApproveDto request,
            @Parameter(hidden = true) @RequestAttribute(required = false) Long currentUserId) {
        
        log.info("Approving pre-approval: {}", id);

        // TODO: Get current user ID from security context
        Long reviewerId = currentUserId != null ? currentUserId : 1L;

        PreApproval preApproval = preApprovalService.approvePreApproval(
            id, reviewerId, request.getApprovedAmount(), request.getNotes());

        PreApprovalResponseDto response = mapToDto(preApproval);

        return ResponseEntity.ok(ApiResponse.success(
            "Pre-approval approved successfully", response));
    }

    /**
     * Reject a pre-approval request
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('APPROVE_PRE_APPROVAL', 'MEDICAL_REVIEWER', 'TPA_MANAGER')")
    @Operation(summary = "Reject pre-approval request")
    public ResponseEntity<ApiResponse<PreApprovalResponseDto>> rejectPreApproval(
            @PathVariable Long id,
            @Valid @RequestBody PreApprovalRejectDto request,
            @Parameter(hidden = true) @RequestAttribute(required = false) Long currentUserId) {
        
        log.info("Rejecting pre-approval: {}", id);

        Long reviewerId = currentUserId != null ? currentUserId : 1L;

        PreApproval preApproval = preApprovalService.rejectPreApproval(
            id, reviewerId, request.getRejectionReason());

        PreApprovalResponseDto response = mapToDto(preApproval);

        return ResponseEntity.ok(ApiResponse.success(
            "Pre-approval rejected", response));
    }

    /**
     * Get all pre-approvals (with pagination)
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_PRE_APPROVAL', 'TPA_STAFF')")
    @Operation(summary = "Get all pre-approvals with pagination")
    public ResponseEntity<ApiResponse<Page<PreApprovalResponseDto>>> getAllPreApprovals(
            Pageable pageable) {
        
        // TODO: Implement proper service method
        return ResponseEntity.ok(ApiResponse.success("Pre-approvals retrieved", null));
    }

    // Helper method to map entity to DTO
    private PreApprovalResponseDto mapToDto(PreApproval entity) {
        return PreApprovalResponseDto.builder()
            .id(entity.getId())
            .approvalNumber(entity.getApprovalNumber())
            .type(entity.getType())
            .memberId(entity.getMember().getId())
            .memberName(entity.getMember().getFullName())
            .memberCardNumber(entity.getMember().getCardNumber())
            .providerId(entity.getProviderId())
            .providerName(entity.getProviderName())
            .serviceCode(entity.getServiceCode())
            .serviceDescription(entity.getServiceDescription())
            .diagnosisCode(entity.getDiagnosisCode())
            .diagnosisDescription(entity.getDiagnosisDescription())
            .requestedAmount(entity.getRequestedAmount())
            .approvedAmount(entity.getApprovedAmount())
            .rejectedAmount(entity.getRejectedAmount())
            .memberRemainingBalance(entity.getMemberRemainingBalance())
            .exceedAmount(entity.getExceedAmount())
            .status(entity.getStatus())
            .requiredLevel(entity.getRequiredLevel())
            .requestDate(entity.getRequestDate())
            .expectedServiceDate(entity.getExpectedServiceDate())
            .requestReason(entity.getRequestReason())
            .medicalReviewNotes(entity.getMedicalReviewNotes())
            .managerNotes(entity.getManagerNotes())
            .validFrom(entity.getValidFrom())
            .validUntil(entity.getValidUntil())
            .expired(entity.getExpired())
            .rejectionReason(entity.getRejectionReason())
            .autoApproved(entity.getAutoApproved())
            .autoApprovalRule(entity.getAutoApprovalRule())
            .notes(entity.getNotes())
            .active(entity.getActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
