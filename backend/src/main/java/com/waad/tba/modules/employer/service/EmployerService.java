package com.waad.tba.modules.employer.service;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.enums.OrganizationType;
import com.waad.tba.modules.employer.dto.EmployerCreateDto;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.dto.EmployerSelectorDto;
import com.waad.tba.modules.employer.mapper.EmployerMapper;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployerService {

    private final EmployerRepository repository;
    private final EmployerMapper mapper;

    public List<EmployerResponseDto> getAll() {
        return repository.findByTypeAndActiveTrue(OrganizationType.EMPLOYER)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<EmployerSelectorDto> getSelectors() {
        return repository.findByTypeAndActiveTrue(OrganizationType.EMPLOYER)
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

        return mapper.toResponse(repository.save(org));
    }
}
