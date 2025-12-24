package com.waad.tba.modules.employer.controller;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.employer.dto.EmployerCreateDto;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.dto.EmployerSelectorDto;
import com.waad.tba.modules.employer.service.EmployerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employers")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerService service;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('VIEW_EMPLOYERS')")
    public ResponseEntity<ApiResponse<List<EmployerResponseDto>>> getAll() {
        List<EmployerResponseDto> employers = service.getAll();
        return ResponseEntity.ok(ApiResponse.success(employers));
    }

    @GetMapping({"/selectors", "/selector"})
    public ResponseEntity<ApiResponse<List<EmployerSelectorDto>>> selectors() {
        List<EmployerSelectorDto> selectors = service.getSelectors();
        return ResponseEntity.ok(ApiResponse.success(selectors));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('MANAGE_EMPLOYERS')")
    public ResponseEntity<ApiResponse<EmployerResponseDto>> create(@Valid @RequestBody EmployerCreateDto dto) {
        EmployerResponseDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Employer created successfully", created));
    }
}
