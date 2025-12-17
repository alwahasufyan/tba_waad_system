package com.waad.tba.modules.policy.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.policy.dto.BenefitPackageDto;
import com.waad.tba.modules.policy.service.BenefitPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benefit-packages")
@RequiredArgsConstructor
public class BenefitPackageController {

    private final BenefitPackageService benefitPackageService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<List<BenefitPackageDto>>> getAllBenefitPackages() {
        List<BenefitPackageDto> benefitPackages = benefitPackageService.getAllBenefitPackages();
        return ResponseEntity.ok(ApiResponse.success(benefitPackages));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('VIEW_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<List<BenefitPackageDto>>> getActiveBenefitPackages() {
        List<BenefitPackageDto> benefitPackages = benefitPackageService.getActiveBenefitPackages();
        return ResponseEntity.ok(ApiResponse.success(benefitPackages));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<BenefitPackageDto>> getBenefitPackageById(@PathVariable Long id) {
        BenefitPackageDto benefitPackage = benefitPackageService.getBenefitPackageById(id);
        return ResponseEntity.ok(ApiResponse.success(benefitPackage));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAuthority('VIEW_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<BenefitPackageDto>> getBenefitPackageByCode(@PathVariable String code) {
        BenefitPackageDto benefitPackage = benefitPackageService.getBenefitPackageByCode(code);
        return ResponseEntity.ok(ApiResponse.success(benefitPackage));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<BenefitPackageDto>> createBenefitPackage(@Valid @RequestBody BenefitPackageDto dto) {
        BenefitPackageDto created = benefitPackageService.createBenefitPackage(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Benefit package created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<BenefitPackageDto>> updateBenefitPackage(
            @PathVariable Long id,
            @Valid @RequestBody BenefitPackageDto dto) {
        BenefitPackageDto updated = benefitPackageService.updateBenefitPackage(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Benefit package updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_BENEFIT_PACKAGES')")
    public ResponseEntity<ApiResponse<Void>> deleteBenefitPackage(@PathVariable Long id) {
        benefitPackageService.deleteBenefitPackage(id);
        return ResponseEntity.ok(ApiResponse.success("Benefit package deleted successfully", null));
    }
}
