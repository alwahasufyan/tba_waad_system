package com.waad.tba.modules.reviewer.mapper;

import com.waad.tba.modules.reviewer.dto.ReviewerCompanyCreateDto;
import com.waad.tba.modules.reviewer.dto.ReviewerCompanyResponseDto;
import com.waad.tba.modules.reviewer.dto.ReviewerCompanySelectorDto;
import com.waad.tba.modules.reviewer.entity.ReviewerCompany;
import org.springframework.stereotype.Component;

@Component
public class ReviewerCompanyMapper {

    public ReviewerCompanyResponseDto toResponseDto(ReviewerCompany entity) {
        if (entity == null) return null;
        
        return ReviewerCompanyResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .medicalDirector(entity.getMedicalDirector())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ReviewerCompanySelectorDto toSelectorDto(ReviewerCompany entity) {
        if (entity == null) return null;
        
        return ReviewerCompanySelectorDto.builder()
                .id(entity.getId())
                .code(entity.getId().toString())
                .nameAr(entity.getName())
                .nameEn(entity.getName())
                .build();
    }

    public ReviewerCompany toEntity(ReviewerCompanyCreateDto dto) {
        if (dto == null) return null;
        
        return ReviewerCompany.builder()
                .name(dto.getName())
                .medicalDirector(dto.getMedicalDirector())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .active(true)
                .build();
    }

    public void updateEntityFromDto(ReviewerCompany entity, ReviewerCompanyCreateDto dto) {
        if (dto == null) return;
        
        entity.setName(dto.getName());
        entity.setMedicalDirector(dto.getMedicalDirector());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress());
    }
}
