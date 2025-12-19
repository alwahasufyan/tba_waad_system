package com.waad.tba.modules.employer.service;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.enums.OrganizationType;
import com.waad.tba.common.repository.OrganizationRepository;
import com.waad.tba.modules.employer.dto.EmployerCreateDto;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.dto.EmployerSelectorDto;
import com.waad.tba.modules.employer.mapper.EmployerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Employer Service - Uses Organization Entity (CANONICAL)
 * 
 * This service is a facade over {@link Organization} with type=EMPLOYER.
 * All CRUD operations work with Organization table only.
 * 
 * ✅ READS: OrganizationRepository.findByType(EMPLOYER)
 * ✅ WRITES: OrganizationRepository.save() with type=EMPLOYER
 * ❌ NEVER uses legacy EmployerRepository for writes
 * 
 * @see Organization
 * @see OrganizationType#EMPLOYER
 */
@Service
@RequiredArgsConstructor
public class EmployerService {

    private final OrganizationRepository organizationRepository;
    private final EmployerMapper mapper;

    public List<EmployerResponseDto> getAll() {
        return organizationRepository.findByTypeAndActiveTrue(OrganizationType.EMPLOYER)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<EmployerSelectorDto> getSelectors() {
        return organizationRepository.findByTypeAndActiveTrue(OrganizationType.EMPLOYER)
                .stream()
                .map(mapper::toSelector)
                .toList();
    }

    public EmployerResponseDto create(EmployerCreateDto dto) {
        Organization org = Organization.builder()
                .name(dto.getName())
                .nameEn(dto.getNameEn())
                .code(dto.getCode())
                .type(OrganizationType.EMPLOYER)
                .active(true)
                .build();

        return mapper.toResponse(organizationRepository.save(org));
    }
}


