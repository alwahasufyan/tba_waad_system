package com.waad.tba.modules.insurance.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
import com.waad.tba.modules.insurance.dto.InsuranceCompanyCreateDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyResponseDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanySelectorDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyUpdateDto;
import com.waad.tba.modules.insurance.service.InsuranceCompanyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/insurance-companies")
@RequiredArgsConstructor
@Tag(name = "Insurance Companies", description = "APIs for managing insurance companies")
public class InsuranceCompanyController {

    private final InsuranceCompanyService insuranceCompanyService;

    @GetMapping("/selector")
    @PreAuthorize("hasAuthority('VIEW_INSURANCE')")
    @Operation(summary = "Get insurance company selector options", description = "Returns active insurance companies for dropdown/selector")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insurance company options retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class)))
    })
    public ResponseEntity<ApiResponse<List<InsuranceCompanySelectorDto>>> getSelectorOptions() {
        List<InsuranceCompanySelectorDto> options = insuranceCompanyService.getSelectorOptions();
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    /**
     * @deprecated Use GET /api/insurance-companies?page=&size=&search= instead (paginated search)
     */
    @Deprecated
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('VIEW_INSURANCE')")
    @Operation(summary = "List all insurance companies", description = "Returns all insurance companies.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insurance companies retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class)))
    })
    public ResponseEntity<ApiResponse<List<InsuranceCompanyResponseDto>>> getAll() {
        List<InsuranceCompanyResponseDto> companies = insuranceCompanyService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Insurance companies retrieved successfully", companies));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_INSURANCE')")
    @Operation(summary = "Paginate insurance companies", description = "Returns a page of insurance companies with pagination and optional search.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insurance companies page retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<PaginationResponse<InsuranceCompanyResponseDto>>> getAllPaginated(
            @Parameter(name = "page", description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(name = "size", description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(name = "search", description = "Search query") @RequestParam(required = false) String search,
            @Parameter(name = "sortBy", description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(name = "sortDir", description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        org.springframework.data.domain.Pageable pageable = PageRequest.of(Math.max(0, page - 1), size,
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.fromString(sortDir), sortBy));
        Page<InsuranceCompanyResponseDto> pageResult = insuranceCompanyService.findAllPaginated(pageable, search);
        PaginationResponse<InsuranceCompanyResponseDto> response = PaginationResponse.<InsuranceCompanyResponseDto>builder()
                .items(pageResult.getContent())
                .total(pageResult.getTotalElements())
                .page(page)
                .size(size)
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('VIEW_INSURANCE')")
    @Operation(summary = "Count insurance companies", description = "Returns total number of insurance companies")
    public ResponseEntity<ApiResponse<Long>> count() {
        long total = insuranceCompanyService.count();
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_INSURANCE')")
    @Operation(summary = "Get insurance company by ID", description = "Returns an insurance company by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insurance company retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Insurance company not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<InsuranceCompanyResponseDto>> getById(
            @Parameter(name = "id", description = "Insurance company ID", required = true)
            @PathVariable Long id) {
        InsuranceCompanyResponseDto company = insuranceCompanyService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Insurance company retrieved successfully", company));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_INSURANCE')")
    @Operation(summary = "Create insurance company", description = "Creates a new insurance company.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Insurance company created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<InsuranceCompanyResponseDto>> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Insurance company creation payload")
            @Valid @RequestBody InsuranceCompanyCreateDto dto) {
        InsuranceCompanyResponseDto created = insuranceCompanyService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Insurance company created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INSURANCE')")
    @Operation(summary = "Update insurance company", description = "Updates an existing insurance company by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insurance company updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Insurance company not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<InsuranceCompanyResponseDto>> update(
            @Parameter(name = "id", description = "Insurance company ID", required = true)
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Insurance company update payload")
            @Valid @RequestBody InsuranceCompanyUpdateDto dto) {
        InsuranceCompanyResponseDto updated = insuranceCompanyService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Insurance company updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INSURANCE')")
    @Operation(summary = "Delete insurance company", description = "Deletes an insurance company by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insurance company deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Insurance company not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(name = "id", description = "Insurance company ID", required = true)
            @PathVariable Long id) {
        insuranceCompanyService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Insurance company deleted successfully", null));
    }

    /**
     * @deprecated Use GET /api/insurance-companies?page=&size=&search= instead (paginated search)
     */
    @Deprecated
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_INSURANCE')")
    @Operation(summary = "Search insurance companies", description = "Search insurance companies by query string.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search results retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<InsuranceCompanyResponseDto>>> search(
            @Parameter(name = "query", description = "Search query", required = true)
            @RequestParam String query) {
        List<InsuranceCompanyResponseDto> results = insuranceCompanyService.search(query);
        return ResponseEntity.ok(ApiResponse.success("Search completed successfully", results));
    }
}
