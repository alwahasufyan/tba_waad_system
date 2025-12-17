package com.waad.tba.modules.company.mapper;

import com.waad.tba.modules.company.dto.CompanyDto;
import com.waad.tba.modules.company.entity.Company;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Company entity and DTO
 */
@Component
public class CompanyMapper {

    public CompanyDto toDto(Company entity) {
        if (entity == null) {
            return null;
        }

        return CompanyDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Company toEntity(CompanyDto dto) {
        if (dto == null) {
            return null;
        }

        return Company.builder()
                .id(dto.getId())
                .name(dto.getName())
                .code(dto.getCode())
                .active(dto.getActive())
                .build();
    }

    public void updateEntityFromDto(CompanyDto dto, Company entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}
