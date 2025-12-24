package com.waad.tba.modules.employer.mapper;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.dto.EmployerSelectorDto;
import org.springframework.stereotype.Component;

/**
 * Employer mapper - maps Organization (type=EMPLOYER) to Employer DTOs.
 */
@Component
public class EmployerMapper {

    public EmployerResponseDto toResponse(Organization org) {
        return EmployerResponseDto.builder()
                .id(org.getId())
                .name(org.getName())
                .nameEn(org.getNameEn())
                .code(org.getCode())
                .active(org.isActive())
                .build();
    }

    public EmployerSelectorDto toSelector(Organization org) {
        return EmployerSelectorDto.builder()
                .id(org.getId())
                .label(org.getName())  // Use 'label' for frontend dropdown
                .build();
    }
}


