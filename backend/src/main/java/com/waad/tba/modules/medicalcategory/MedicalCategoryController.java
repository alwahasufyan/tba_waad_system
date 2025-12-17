package com.waad.tba.modules.medicalcategory;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.common.dto.PaginationResponse;
import com.waad.tba.modules.medicalcategory.dto.*;
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

/**
 * Medical Category REST Controller
 * Provides API endpoints for medical category management
 */
@RestController
@RequestMapping("/api/medical-categories")
@RequiredArgsConstructor
@Tag(name = "Medical Categories", description = "APIs for managing medical categories")
public class MedicalCategoryController {

    private final MedicalCategoryService service;

    @GetMapping("/selector")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_CATEGORIES', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Get medical category selector options", description = "Returns active medical categories for dropdown/selector")
    public ResponseEntity<ApiResponse<List<MedicalCategorySelectorDto>>> getSelectorOptions() {
        List<MedicalCategorySelectorDto> options = service.getSelectorOptions();
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    /**
     * Get all medical categories with pagination
     * GET /api/medical-categories
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_CATEGORIES', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "List medical categories with pagination", description = "Returns paginated list of medical categories with optional search")
    public ResponseEntity<ApiResponse<PaginationResponse<MedicalCategoryViewDto>>> list(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Search query") @RequestParam(required = false) String search,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, sort);
        
        Page<MedicalCategoryViewDto> pageResult = service.findAllPaginated(pageRequest, search);
        
        PaginationResponse<MedicalCategoryViewDto> response = PaginationResponse.<MedicalCategoryViewDto>builder()
                .items(pageResult.getContent())
                .total(pageResult.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get medical category by ID
     * GET /api/medical-categories/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_CATEGORIES', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Get medical category by ID")
    public ResponseEntity<ApiResponse<MedicalCategoryViewDto>> getCategoryById(@PathVariable Long id) {
        MedicalCategoryViewDto category = service.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Medical category retrieved successfully", category));
    }

    /**
     * Get medical category by code
     * GET /api/medical-categories/code/{code}
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_CATEGORIES', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Get medical category by code")
    public ResponseEntity<ApiResponse<MedicalCategoryViewDto>> getCategoryByCode(@PathVariable String code) {
        MedicalCategoryViewDto category = service.findByCode(code);
        return ResponseEntity.ok(ApiResponse.success("Medical category retrieved successfully", category));
    }

    /**
     * Create new medical category
     * POST /api/medical-categories
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Create medical category")
    public ResponseEntity<ApiResponse<MedicalCategoryViewDto>> createCategory(@Valid @RequestBody MedicalCategoryCreateDto dto) {
        MedicalCategoryViewDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medical category created successfully", created));
    }

    /**
     * Update medical category
     * PUT /api/medical-categories/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Update medical category")
    public ResponseEntity<ApiResponse<MedicalCategoryViewDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody MedicalCategoryUpdateDto dto) {
        MedicalCategoryViewDto updated = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Medical category updated successfully", updated));
    }

    /**
     * Delete medical category
     * DELETE /api/medical-categories/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Delete medical category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Medical category deleted successfully", null));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_CATEGORIES', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Count medical categories")
    public ResponseEntity<ApiResponse<Long>> count() {
        long total = service.count();
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'VIEW_MEDICAL_CATEGORIES', 'MANAGE_MEDICAL_CATEGORIES')")
    @Operation(summary = "Search medical categories")
    public ResponseEntity<ApiResponse<List<MedicalCategoryViewDto>>> search(@RequestParam String query) {
        List<MedicalCategoryViewDto> results = service.search(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
