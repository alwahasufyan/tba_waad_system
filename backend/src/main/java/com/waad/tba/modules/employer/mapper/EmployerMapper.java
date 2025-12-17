package com.waad.tba.modules.employer.mapper;

import com.waad.tba.modules.employer.dto.EmployerCreateDto;
import com.waad.tba.modules.employer.dto.EmployerResponseDto;
import com.waad.tba.modules.employer.entity.Employer;
import org.springframework.stereotype.Component;

@Component
public class EmployerMapper {

    public EmployerResponseDto toResponseDto(Employer entity) {
        if (entity == null) return null;
        
        return EmployerResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .active(entity.getActive())
                .address(entity.getAddress())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Employer toEntity(EmployerCreateDto dto) {
        if (dto == null) return null;
        
        return Employer.builder()
                .code(dto.getCode())
                .nameAr(dto.getNameAr())
                .nameEn(dto.getNameEn())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .active(Boolean.TRUE.equals(dto.getActive()) ? dto.getActive() : true)
                .build();
    }

    public void updateEntityFromDto(Employer entity, EmployerCreateDto dto) {
        if (dto == null) return;
        
        entity.setCode(dto.getCode());
        entity.setNameAr(dto.getNameAr());
        entity.setNameEn(dto.getNameEn());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress());
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}
