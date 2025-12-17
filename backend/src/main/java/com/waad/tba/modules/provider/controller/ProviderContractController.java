package com.waad.tba.modules.provider.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.common.dto.PaginationResponse;
import com.waad.tba.modules.provider.dto.ProviderContractCreateDto;
import com.waad.tba.modules.provider.dto.ProviderContractUpdateDto;
import com.waad.tba.modules.provider.dto.ProviderContractViewDto;
import com.waad.tba.modules.provider.service.ProviderContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider-contracts")
@RequiredArgsConstructor
public class ProviderContractController {

    private final ProviderContractService contractService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_PROVIDERS')")
    public ResponseEntity<ApiResponse<ProviderContractViewDto>> createContract(@RequestBody ProviderContractCreateDto dto) {
        ProviderContractViewDto contract = contractService.createContract(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contract created successfully", contract));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_PROVIDERS')")
    public ResponseEntity<ApiResponse<ProviderContractViewDto>> updateContract(
            @PathVariable Long id,
            @RequestBody ProviderContractUpdateDto dto) {
        ProviderContractViewDto contract = contractService.updateContract(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Contract updated successfully", contract));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<ProviderContractViewDto>> getContract(@PathVariable Long id) {
        ProviderContractViewDto contract = contractService.getContract(id);
        return ResponseEntity.ok(ApiResponse.success("Contract retrieved successfully", contract));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<PaginationResponse<ProviderContractViewDto>> listContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<ProviderContractViewDto> contracts = contractService.listContracts(page, size, search);
        
        PaginationResponse<ProviderContractViewDto> response = PaginationResponse.<ProviderContractViewDto>builder()
                .items(contracts.getContent())
                .total(contracts.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_PROVIDERS')")
    public ResponseEntity<ApiResponse<Void>> deleteContract(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok(ApiResponse.success("Contract deleted successfully", null));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<List<ProviderContractViewDto>>> getContractsByProvider(@PathVariable Long providerId) {
        List<ProviderContractViewDto> contracts = contractService.getContractsByProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success("Provider contracts retrieved successfully", contracts));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_PROVIDERS')")
    public ResponseEntity<ApiResponse<Long>> countContracts() {
        long count = contractService.countContracts();
        return ResponseEntity.ok(ApiResponse.success("Contract count retrieved successfully", count));
    }
}
