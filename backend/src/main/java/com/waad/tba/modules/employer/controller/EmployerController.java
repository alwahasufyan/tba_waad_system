package com.waad.tba.modules.employer.controller;

import com.waad.tba.modules.employer.dto.EmployerCreateDto;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.dto.EmployerSelectorDto;
import com.waad.tba.modules.employer.service.EmployerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public List<EmployerResponseDto> getAll() {
        return service.getAll();
    }

    @GetMapping("/selectors")
    public List<EmployerSelectorDto> selectors() {
        return service.getSelectors();
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('MANAGE_EMPLOYERS')")
    public EmployerResponseDto create(@Valid @RequestBody EmployerCreateDto dto) {
        return service.create(dto);
    }
}
