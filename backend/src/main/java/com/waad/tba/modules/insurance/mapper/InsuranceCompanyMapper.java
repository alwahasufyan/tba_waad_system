package com.waad.tba.modules.insurance.mapper;

import org.springframework.stereotype.Component;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyCreateDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyResponseDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanySelectorDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyUpdateDto;

/**
 * Insurance Company mapper - maps Organization (type=INSURANCE) to Insurance DTOs.
 */
@Component
public class InsuranceCompanyMapper {

    public InsuranceCompanyResponseDto toResponseDto(Organization entity) {
        if (entity == null) return null;
        
        return InsuranceCompanyResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .address(null) // Organization doesn't have address field
                .phone(null) // Organization doesn't have phone field
                .email(null) // Organization doesn't have email field
                .contactPerson(null) // Organization doesn't have contactPerson field
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public InsuranceCompanySelectorDto toSelectorDto(Organization entity) {
        if (entity == null) return null;
        
        return InsuranceCompanySelectorDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getName())
                .nameEn(entity.getNameEn())
                .build();
    }

    public Organization toEntity(InsuranceCompanyCreateDto dto) {
        if (dto == null) return null;
        
        return Organization.builder()
                .name(dto.getName())
                .nameEn(dto.getName()) // Use name for both if nameEn not provided
                .code(dto.getCode() != null ? dto.getCode() : "INS-" + System.currentTimeMillis())
                .build();
    }

    public void updateEntityFromDto(InsuranceCompanyUpdateDto dto, Organization entity) {
        if (dto == null) return;
        
        entity.setName(dto.getName());
        if (dto.getCode() != null) {
            entity.setCode(dto.getCode());
        }
        // Organization doesn't have address, phone, email, contactPerson fields
        // These fields are not updated as Organization is simplified
    }
}
