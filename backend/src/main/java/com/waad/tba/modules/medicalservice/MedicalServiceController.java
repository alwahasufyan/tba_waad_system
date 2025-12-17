package com.waad.tba.modules.medicalservice;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.common.dto.PaginationResponse;
import com.waad.tba.modules.medicalservice.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-services")
@RequiredArgsConstructor
@Tag(name = "Medical Services", description = "APIs for managing medical services")
public class MedicalServiceController {

    private final MedicalServiceService service;

    @GetMapping("/selector")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_SERVICES', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Get medical service selector options", description = "Returns active medical services for dropdown/selector")
    public ResponseEntity<ApiResponse<List<MedicalServiceSelectorDto>>> getSelectorOptions() {
        List<MedicalServiceSelectorDto> options = service.getSelectorOptions();
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_SERVICES', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "List medical services with pagination", description = "Returns paginated list of medical services with optional search")
    public ResponseEntity<ApiResponse<PaginationResponse<MedicalServiceViewDto>>> list(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Search query") @RequestParam(required = false) String search,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, sort);
        
        Page<MedicalServiceViewDto> pageResult = service.findAllPaginated(pageRequest, search);
        
        PaginationResponse<MedicalServiceViewDto> response = PaginationResponse.<MedicalServiceViewDto>builder()
                .items(pageResult.getContent())
                .total(pageResult.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_SERVICES', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Get medical service by ID")
    public ResponseEntity<ApiResponse<MedicalServiceViewDto>> getById(@PathVariable Long id) {
        MedicalServiceViewDto service = this.service.findById(id);
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Create medical service")
    public ResponseEntity<ApiResponse<MedicalServiceViewDto>> create(@Valid @RequestBody MedicalServiceCreateDto dto) {
        MedicalServiceViewDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Medical service created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Update medical service")
    public ResponseEntity<ApiResponse<MedicalServiceViewDto>> update(
            @PathVariable Long id, 
            @Valid @RequestBody MedicalServiceUpdateDto dto) {
        MedicalServiceViewDto updated = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Medical service updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Delete medical service")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Medical service deleted successfully", null));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_SERVICES', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Count medical services")
    public ResponseEntity<ApiResponse<Long>> count() {
        long total = service.count();
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_SERVICES', 'MANAGE_MEDICAL_SERVICES')")
    @Operation(summary = "Search medical services")
    public ResponseEntity<ApiResponse<List<MedicalServiceViewDto>>> search(@RequestParam String query) {
        List<MedicalServiceViewDto> results = service.search(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
