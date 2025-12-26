package com.waad.tba.modules.insurancepolicy.mapper;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyCreateDto;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyUpdateDto;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyViewDto;
import com.waad.tba.modules.insurancepolicy.entity.InsurancePolicy;
import org.springframework.stereotype.Component;

@Component
public class InsurancePolicyMapper {

    public InsurancePolicyViewDto toViewDto(InsurancePolicy entity) {
        if (entity == null) return null;

        return InsurancePolicyViewDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .active(entity.getActive())
                .insuranceCompanyId(entity.getInsuranceOrganization() != null ? entity.getInsuranceOrganization().getId() : null)
                .insuranceCompanyName(entity.getInsuranceOrganization() != null ? entity.getInsuranceOrganization().getName() : null)
                .insuranceCompanyCode(entity.getInsuranceOrganization() != null ? entity.getInsuranceOrganization().getCode() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public InsurancePolicy toEntity(InsurancePolicyCreateDto dto, Organization insuranceOrganization) {
        if (dto == null) return null;

        return InsurancePolicy.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .insuranceOrganization(insuranceOrganization)
                .active(Boolean.TRUE.equals(dto.getActive()))
                .build();
    }

    public void updateEntityFromDto(InsurancePolicyUpdateDto dto, InsurancePolicy entity, Organization insuranceOrganization) {
        if (dto == null) return;

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getCode() != null) entity.setCode(dto.getCode());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
        if (insuranceOrganization != null) entity.setInsuranceOrganization(insuranceOrganization);
        if (dto.getActive() != null) entity.setActive(dto.getActive());
    }
}
