package com.waad.tba.modules.dashboard.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.dashboard.dto.ClaimsPerDayDto;
import com.waad.tba.modules.dashboard.dto.DashboardStatsDto;
import com.waad.tba.modules.dashboard.service.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for dashboard statistics and charts")
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('VIEW_REPORTS')")
    @Operation(summary = "Get dashboard stats", description = "Returns aggregate statistics for the dashboard overview. Accepts optional X-Employer-ID header for filtering.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Stats retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal Server Error", content=@io.swagger.v3.oas.annotations.media.Content(schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=com.waad.tba.common.error.ApiError.class)))
    })
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats(
            @Parameter(name = "X-Employer-ID", description = "Optional employer ID for filtering stats", required = false)
            @RequestHeader(value = "X-Employer-ID", required = false) Long employerId) {
        DashboardStatsDto stats = service.getStats(employerId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/claims-per-day")
    @PreAuthorize("hasAuthority('VIEW_REPORTS')")
    @Operation(summary = "Get claims per day", description = "Returns claims count per day for the given date range. Accepts optional X-Employer-ID header for filtering.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Data retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date range"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<ClaimsPerDayDto>>> getClaimsPerDay(
            @Parameter(name = "X-Employer-ID", description = "Optional employer ID for filtering claims", required = false)
            @RequestHeader(value = "X-Employer-ID", required = false) Long employerId,
            @Parameter(name = "startDate", description = "Start date (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(name = "endDate", description = "End date (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ClaimsPerDayDto> data = service.getClaimsPerDay(employerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
