package com.waad.tba.modules.provider.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.common.dto.PaginationResponse;
import com.waad.tba.modules.provider.dto.ProviderCreateDto;
import com.waad.tba.modules.provider.dto.ProviderSelectorDto;
import com.waad.tba.modules.provider.dto.ProviderUpdateDto;
import com.waad.tba.modules.provider.dto.ProviderViewDto;
import com.waad.tba.modules.provider.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @GetMapping("/selector")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<List<ProviderSelectorDto>>> getSelectorOptions() {
        List<ProviderSelectorDto> options = providerService.getSelectorOptions();
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_PROVIDERS')")
    public ResponseEntity<ApiResponse<ProviderViewDto>> createProvider(@Valid @RequestBody ProviderCreateDto dto) {
        ProviderViewDto provider = providerService.createProvider(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Provider created successfully", provider));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_PROVIDERS')")
    public ResponseEntity<ApiResponse<ProviderViewDto>> updateProvider(
            @PathVariable Long id,
            @Valid @RequestBody ProviderUpdateDto dto) {
        ProviderViewDto provider = providerService.updateProvider(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Provider updated successfully", provider));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<ProviderViewDto>> getProvider(@PathVariable Long id) {
        ProviderViewDto provider = providerService.getProvider(id);
        return ResponseEntity.ok(ApiResponse.success("Provider retrieved successfully", provider));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<PaginationResponse<ProviderViewDto>>> listProviders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<ProviderViewDto> providers = providerService.listProviders(Math.max(0, page - 1), size, search);
        
        PaginationResponse<ProviderViewDto> response = PaginationResponse.<ProviderViewDto>builder()
                .items(providers.getContent())
                .total(providers.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_PROVIDERS')")
    public ResponseEntity<ApiResponse<Void>> deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return ResponseEntity.ok(ApiResponse.success("Provider deleted successfully", null));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<List<ProviderViewDto>>> getAllActiveProviders() {
        List<ProviderViewDto> providers = providerService.getAllActiveProviders();
        return ResponseEntity.ok(ApiResponse.success("Active providers retrieved successfully", providers));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<Long>> countProviders() {
        long count = providerService.countProviders();
        return ResponseEntity.ok(ApiResponse.success("Provider count retrieved successfully", count));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<List<ProviderViewDto>>> search(@RequestParam String query) {
        List<ProviderViewDto> results = providerService.search(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
