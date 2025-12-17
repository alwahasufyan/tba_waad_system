package com.waad.tba.modules.company.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.waad.tba.modules.company.dto.CompanySettingsDto;
import com.waad.tba.modules.company.dto.UiVisibilityDto;
import com.waad.tba.modules.company.entity.CompanySettings;
import com.waad.tba.modules.company.service.CompanySettingsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * CompanySettingsController - Phase 9 + Phase B4
 * 
 * REST API endpoints for company settings and feature toggles.
 * Handles employer-level configuration and UI visibility settings.
 */
@Slf4j
@RestController
@RequestMapping("/company-settings")
@RequiredArgsConstructor
@Tag(name = "Company Settings", description = "Company Settings and Feature Toggles API")
public class CompanySettingsController {

    private final CompanySettingsService companySettingsService;

    /**
     * Get feature toggle settings for an employer.
     * 
     * @param employerId Employer ID
     * @return CompanySettingsDto with feature toggles
     */
    @GetMapping("/employer/{employerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INSURANCE_ADMIN')")
    @Operation(summary = "Get settings for employer", 
               description = "Retrieve feature toggle settings for a specific employer")
    public ResponseEntity<CompanySettingsDto> getSettingsForEmployer(@PathVariable Long employerId) {
        log.info("GET /company-settings/employer/{}", employerId);
        CompanySettings settings = companySettingsService.getSettingsForEmployer(employerId);
        return ResponseEntity.ok(companySettingsService.toDto(settings));
    }

    /**
     * Update feature toggle settings for an employer.
     * 
     * @param employerId Employer ID
     * @param dto Settings DTO with new values
     * @return Updated settings
     */
    @PutMapping("/employer/{employerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INSURANCE_ADMIN')")
    @Operation(summary = "Update settings for employer", 
               description = "Update feature toggle settings for a specific employer")
    public ResponseEntity<CompanySettingsDto> updateSettings(
            @PathVariable Long employerId,
            @Valid @RequestBody CompanySettingsDto dto) {
        log.info("PUT /company-settings/employer/{}", employerId);
        CompanySettings updated = companySettingsService.updateSettings(employerId, dto);
        return ResponseEntity.ok(companySettingsService.toDto(updated));
    }

    // ============================================================================
    // Phase B4 - UI Visibility Endpoints
    // ============================================================================

    /**
     * Get UI visibility settings for an employer.
     * 
     * @param employerId Employer ID
     * @return UiVisibilityDto with visibility settings
     */
    @GetMapping("/employer/{employerId}/ui")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INSURANCE_ADMIN')")
    @Operation(summary = "Get UI visibility settings", 
               description = "Retrieve UI visibility configuration for a specific employer")
    public ResponseEntity<UiVisibilityDto> getUiVisibility(@PathVariable Long employerId) {
        log.info("GET /company-settings/employer/{}/ui", employerId);
        UiVisibilityDto dto = companySettingsService.getUiVisibilityForEmployer(employerId);
        return ResponseEntity.ok(dto);
    }

    /**
     * Update UI visibility settings for an employer.
     * 
     * @param employerId Employer ID
     * @param uiVisibilityDto New visibility settings
     * @return Updated visibility settings
     */
    @PutMapping("/employer/{employerId}/ui")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INSURANCE_ADMIN')")
    @Operation(summary = "Update UI visibility settings", 
               description = "Update UI visibility configuration for a specific employer")
    public ResponseEntity<UiVisibilityDto> updateUiVisibility(
            @PathVariable Long employerId,
            @Valid @RequestBody UiVisibilityDto uiVisibilityDto) {
        log.info("PUT /company-settings/employer/{}/ui", employerId);
        UiVisibilityDto updated = companySettingsService.updateUiVisibilityForEmployer(employerId, uiVisibilityDto);
        return ResponseEntity.ok(updated);
    }
}
