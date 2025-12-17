package com.waad.tba.modules.insurance.mapper;

import org.springframework.stereotype.Component;

import com.waad.tba.modules.insurance.dto.InsuranceCompanyCreateDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyResponseDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanySelectorDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyUpdateDto;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;

@Component
public class InsuranceCompanyMapper {

    public InsuranceCompanyResponseDto toResponseDto(InsuranceCompany entity) {
        if (entity == null) return null;
        
        return InsuranceCompanyResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .address(entity.getAddress())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .contactPerson(entity.getContactPerson())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public InsuranceCompanySelectorDto toSelectorDto(InsuranceCompany entity) {
        if (entity == null) return null;
        
        return InsuranceCompanySelectorDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getName())
                .nameEn(entity.getName())
                .build();
    }

    public InsuranceCompany toEntity(InsuranceCompanyCreateDto dto) {
        if (dto == null) return null;
        
        return InsuranceCompany.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .contactPerson(dto.getContactPerson())
                .active(Boolean.TRUE.equals(dto.getActive()))
                .build();
    }

    public void updateEntityFromDto(InsuranceCompanyUpdateDto dto, InsuranceCompany entity) {
        if (dto == null) return;
        
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getCode() != null) entity.setCode(dto.getCode());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getContactPerson() != null) entity.setContactPerson(dto.getContactPerson());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
    }
}
