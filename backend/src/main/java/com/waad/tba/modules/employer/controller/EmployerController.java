package com.waad.tba.modules.employer.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.employer.dto.EmployerCreateDto;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.dto.EmployerSelectorDto;
import com.waad.tba.modules.employer.service.EmployerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employers")
@RequiredArgsConstructor
@Tag(name = "Employers", description = "APIs for managing employers")
public class EmployerController {

    private final EmployerService service;

    @GetMapping("/selector")
    @PreAuthorize("hasAnyAuthority('ADMIN','TBA_OPERATIONS','TBA_MEDICAL_REVIEWER','TBA_FINANCE')")
    @Operation(summary = "Get employer selector options", description = "Returns active employers for dropdown/selector. Used by TBA staff to filter data by employer.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employer options retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Only TBA staff can access", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class)))
    })
    public ResponseEntity<ApiResponse<List<EmployerSelectorDto>>> getSelectorOptions() {
        List<EmployerSelectorDto> options = service.getSelectorOptions();
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    /**
     * @deprecated Use GET /api/employers?page=&size=&search= instead (paginated search)
     */
    @Deprecated
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "List all employers", description = "Returns all employers.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employers retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class)))
    })
    public ResponseEntity<ApiResponse<List<EmployerResponseDto>>> getAll() {
        List<EmployerResponseDto> list = service.findAll();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Get employer by ID", description = "Returns an employer by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employer retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Employer not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<EmployerResponseDto>> getById(
            @Parameter(name = "id", description = "Employer ID", required = true)
            @PathVariable Long id) {
        EmployerResponseDto dto = service.findById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Create employer", description = "Creates a new employer.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Employer created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<EmployerResponseDto>> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Employer creation payload")
            @Valid @RequestBody EmployerCreateDto dto) {
        EmployerResponseDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employer created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Update employer", description = "Updates an existing employer by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employer updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Employer not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<EmployerResponseDto>> update(
            @Parameter(name = "id", description = "Employer ID", required = true)
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Employer update payload")
            @Valid @RequestBody EmployerCreateDto dto) {
        EmployerResponseDto updated = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Employer updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Delete employer", description = "Deletes an employer by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employer deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Employer not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(name = "id", description = "Employer ID", required = true)
            @PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Employer deleted successfully", null));
    }

    /**
     * @deprecated Use GET /api/employers?page=&size=&search= instead (paginated search)
     */
    @Deprecated
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Search employers", description = "Search employers by query string.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employers retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<EmployerResponseDto>>> search(
            @Parameter(name = "query", description = "Search query", required = true)
            @RequestParam String query) {
        List<EmployerResponseDto> list = service.search(query);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/paginate")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Paginate employers", description = "Returns a page of employers.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Employers page retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<com.waad.tba.common.dto.PaginationResponse<EmployerResponseDto>>> paginate(
            @Parameter(name = "page", description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(name = "size", description = "Page size")
            @RequestParam(defaultValue = "10") int size) {
        com.waad.tba.common.dto.PaginationResponse<EmployerResponseDto> response = service.findAllPaginated(PageRequest.of(page, size), null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "List employers", description = "Returns a paginated list of employers with optional search.")
    public ResponseEntity<ApiResponse<com.waad.tba.common.dto.PaginationResponse<EmployerResponseDto>>> list(
            @Parameter(name = "page", description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(name = "size", description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(name = "search", description = "Search query") @RequestParam(required = false) String search,
            @Parameter(name = "sortBy", description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(name = "sortDir", description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        org.springframework.data.domain.Pageable pageable = PageRequest.of(Math.max(0, page - 1), size,
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.fromString(sortDir), sortBy));
        com.waad.tba.common.dto.PaginationResponse<EmployerResponseDto> response = service.findAllPaginated(pageable, search);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYERS')")
    @Operation(summary = "Count employers", description = "Returns total number of employers")
    public ResponseEntity<ApiResponse<Long>> count() {
        long total = service.count();
        return ResponseEntity.ok(ApiResponse.success(total));
    }
}
