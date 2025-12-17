package com.waad.tba.modules.preauth.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.preauth.dto.ApprovePreAuthDto;
import com.waad.tba.modules.preauth.dto.PreAuthorizationDto;
import com.waad.tba.modules.preauth.dto.RejectPreAuthDto;
import com.waad.tba.modules.preauth.service.PreAuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pre-authorizations")
@RequiredArgsConstructor
public class PreAuthorizationController {

    private final PreAuthorizationService preAuthService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PreAuthorizationDto>>> getAllPreAuthorizations() {
        List<PreAuthorizationDto> preAuths = preAuthService.getAllPreAuthorizations();
        return ResponseEntity.ok(ApiResponse.success(preAuths));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> getPreAuthorizationById(@PathVariable Long id) {
        PreAuthorizationDto preAuth = preAuthService.getPreAuthorizationById(id);
        return ResponseEntity.ok(ApiResponse.success(preAuth));
    }

    @GetMapping("/number/{preAuthNumber}")
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> getPreAuthorizationByNumber(@PathVariable String preAuthNumber) {
        PreAuthorizationDto preAuth = preAuthService.getPreAuthorizationByNumber(preAuthNumber);
        return ResponseEntity.ok(ApiResponse.success(preAuth));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<PreAuthorizationDto>>> getPreAuthorizationsByMember(@PathVariable Long memberId) {
        List<PreAuthorizationDto> preAuths = preAuthService.getPreAuthorizationsByMember(memberId);
        return ResponseEntity.ok(ApiResponse.success(preAuths));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<PreAuthorizationDto>>> getPreAuthorizationsByProvider(@PathVariable Long providerId) {
        List<PreAuthorizationDto> preAuths = preAuthService.getPreAuthorizationsByProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success(preAuths));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PreAuthorizationDto>>> getPreAuthorizationsByStatus(@PathVariable String status) {
        List<PreAuthorizationDto> preAuths = preAuthService.getPreAuthorizationsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(preAuths));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> createPreAuthorization(@Valid @RequestBody PreAuthorizationDto dto) {
        PreAuthorizationDto created = preAuthService.createPreAuthorization(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pre-authorization created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> updatePreAuthorization(
            @PathVariable Long id,
            @Valid @RequestBody PreAuthorizationDto dto) {
        PreAuthorizationDto updated = preAuthService.updatePreAuthorization(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Pre-authorization updated successfully", updated));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> approvePreAuthorization(
            @PathVariable Long id,
            @Valid @RequestBody ApprovePreAuthDto dto,
            @RequestParam Long reviewerId) {
        PreAuthorizationDto approved = preAuthService.approvePreAuthorization(id, dto, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Pre-authorization approved successfully", approved));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> rejectPreAuthorization(
            @PathVariable Long id,
            @Valid @RequestBody RejectPreAuthDto dto,
            @RequestParam Long reviewerId) {
        PreAuthorizationDto rejected = preAuthService.rejectPreAuthorization(id, dto, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Pre-authorization rejected successfully", rejected));
    }

    @PostMapping("/{id}/under-review")
    public ResponseEntity<ApiResponse<PreAuthorizationDto>> markUnderReview(
            @PathVariable Long id,
            @RequestParam Long reviewerId) {
        PreAuthorizationDto updated = preAuthService.markUnderReview(id, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Pre-authorization marked as under review", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePreAuthorization(@PathVariable Long id) {
        preAuthService.deletePreAuthorization(id);
        return ResponseEntity.ok(ApiResponse.success("Pre-authorization deleted successfully", null));
    }
}
