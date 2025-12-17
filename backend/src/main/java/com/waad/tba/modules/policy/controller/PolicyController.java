package com.waad.tba.modules.policy.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.policy.dto.PolicyDto;
import com.waad.tba.modules.policy.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getAllPolicies() {
        List<PolicyDto> policies = policyService.getAllPolicies();
        return ResponseEntity.ok(ApiResponse.success(policies));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getActivePolicies() {
        List<PolicyDto> policies = policyService.getActivePolicies();
        return ResponseEntity.ok(ApiResponse.success(policies));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    public ResponseEntity<ApiResponse<PolicyDto>> getPolicyById(@PathVariable Long id) {
        PolicyDto policy = policyService.getPolicyById(id);
        return ResponseEntity.ok(ApiResponse.success(policy));
    }

    @GetMapping("/number/{policyNumber}")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    public ResponseEntity<ApiResponse<PolicyDto>> getPolicyByNumber(@PathVariable String policyNumber) {
        PolicyDto policy = policyService.getPolicyByNumber(policyNumber);
        return ResponseEntity.ok(ApiResponse.success(policy));
    }

    @GetMapping("/employer/{employerId}")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getPoliciesByEmployer(@PathVariable Long employerId) {
        List<PolicyDto> policies = policyService.getPoliciesByEmployer(employerId);
        return ResponseEntity.ok(ApiResponse.success(policies));
    }

    @GetMapping("/insurance/{insuranceCompanyId}")
    @PreAuthorize("hasAuthority('VIEW_POLICIES')")
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getPoliciesByInsuranceCompany(@PathVariable Long insuranceCompanyId) {
        List<PolicyDto> policies = policyService.getPoliciesByInsuranceCompany(insuranceCompanyId);
        return ResponseEntity.ok(ApiResponse.success(policies));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    public ResponseEntity<ApiResponse<PolicyDto>> createPolicy(@Valid @RequestBody PolicyDto dto) {
        PolicyDto created = policyService.createPolicy(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Policy created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    public ResponseEntity<ApiResponse<PolicyDto>> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody PolicyDto dto) {
        PolicyDto updated = policyService.updatePolicy(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Policy updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    public ResponseEntity<ApiResponse<PolicyDto>> updatePolicyStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        PolicyDto updated = policyService.updatePolicyStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Policy status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_POLICIES')")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Policy deleted successfully", null));
    }
}
