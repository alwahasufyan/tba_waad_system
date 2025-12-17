package com.waad.tba.modules.insurancepolicy.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyCreateDto;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyUpdateDto;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyViewDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageCreateDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageUpdateDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageViewDto;
import com.waad.tba.modules.insurancepolicy.service.InsurancePolicyService;
import com.waad.tba.modules.insurancepolicy.service.PolicyBenefitPackageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/insurance-policies")
@RequiredArgsConstructor
@Tag(name = "Insurance Policies", description = "APIs for managing insurance policy templates")
public class InsurancePolicyController {

    private final InsurancePolicyService insurancePolicyService;
    private final PolicyBenefitPackageService benefitPackageService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    @Operation(summary = "Create insurance policy", description = "Creates a new insurance policy template.")
    public ResponseEntity<ApiResponse<InsurancePolicyViewDto>> createPolicy(
            @Valid @RequestBody InsurancePolicyCreateDto dto) {
        InsurancePolicyViewDto created = insurancePolicyService.createPolicy(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Insurance policy created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    @Operation(summary = "Update insurance policy", description = "Updates an existing insurance policy template.")
    public ResponseEntity<ApiResponse<InsurancePolicyViewDto>> updatePolicy(
            @Parameter(name = "id", description = "Policy ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody InsurancePolicyUpdateDto dto) {
        InsurancePolicyViewDto updated = insurancePolicyService.updatePolicy(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Insurance policy updated successfully", updated));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    @Operation(summary = "Get insurance policy by ID", description = "Returns an insurance policy by ID.")
    public ResponseEntity<ApiResponse<InsurancePolicyViewDto>> getPolicy(
            @Parameter(name = "id", description = "Policy ID", required = true)
            @PathVariable Long id) {
        InsurancePolicyViewDto policy = insurancePolicyService.getPolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Insurance policy retrieved successfully", policy));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    @Operation(summary = "List insurance policies", description = "Returns a paginated list of insurance policies with optional search.")
    public ResponseEntity<ApiResponse<PaginationResponse<InsurancePolicyViewDto>>> listPolicies(
            @Parameter(name = "page", description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(name = "size", description = "Page size")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(name = "search", description = "Search keyword")
            @RequestParam(required = false) String search,
            @Parameter(name = "sortBy", description = "Sort by field")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(name = "sortDir", description = "Sort direction")
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size,
                Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        
        Page<InsurancePolicyViewDto> pageResult = insurancePolicyService.listPolicies(pageable, search);
        
        PaginationResponse<InsurancePolicyViewDto> response = PaginationResponse.<InsurancePolicyViewDto>builder()
                .items(pageResult.getContent())
                .total(pageResult.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    @Operation(summary = "Delete insurance policy", description = "Soft deletes an insurance policy by ID.")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(
            @Parameter(name = "id", description = "Policy ID", required = true)
            @PathVariable Long id) {
        insurancePolicyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Insurance policy deleted successfully", null));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    @Operation(summary = "Count insurance policies", description = "Returns total number of insurance policies")
    public ResponseEntity<ApiResponse<Long>> count() {
        long total = insurancePolicyService.count();
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    // ==================== Benefit Package Endpoints ====================

    @PostMapping("/{policyId}/packages")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    @Operation(summary = "Add benefit package to policy", description = "Creates a new benefit package for a policy.")
    public ResponseEntity<ApiResponse<PolicyBenefitPackageViewDto>> createBenefitPackage(
            @Parameter(name = "policyId", description = "Policy ID", required = true)
            @PathVariable Long policyId,
            @Valid @RequestBody PolicyBenefitPackageCreateDto dto) {
        PolicyBenefitPackageViewDto created = benefitPackageService.createBenefitPackage(policyId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Benefit package created successfully", created));
    }

    @GetMapping("/{policyId}/packages")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    @Operation(summary = "List benefit packages for policy", description = "Returns all benefit packages for a policy.")
    public ResponseEntity<ApiResponse<List<PolicyBenefitPackageViewDto>>> listBenefitPackages(
            @Parameter(name = "policyId", description = "Policy ID", required = true)
            @PathVariable Long policyId) {
        List<PolicyBenefitPackageViewDto> packages = benefitPackageService.listBenefitPackagesByPolicy(policyId);
        return ResponseEntity.ok(ApiResponse.success("Benefit packages retrieved successfully", packages));
    }

    @PutMapping("/packages/{id}")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    @Operation(summary = "Update benefit package", description = "Updates an existing benefit package.")
    public ResponseEntity<ApiResponse<PolicyBenefitPackageViewDto>> updateBenefitPackage(
            @Parameter(name = "id", description = "Benefit package ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody PolicyBenefitPackageUpdateDto dto) {
        PolicyBenefitPackageViewDto updated = benefitPackageService.updateBenefitPackage(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Benefit package updated successfully", updated));
    }

    @DeleteMapping("/packages/{id}")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    @Operation(summary = "Delete benefit package", description = "Soft deletes a benefit package by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteBenefitPackage(
            @Parameter(name = "id", description = "Benefit package ID", required = true)
            @PathVariable Long id) {
        benefitPackageService.deleteBenefitPackage(id);
        return ResponseEntity.ok(ApiResponse.success("Benefit package deleted successfully", null));
    }
}
