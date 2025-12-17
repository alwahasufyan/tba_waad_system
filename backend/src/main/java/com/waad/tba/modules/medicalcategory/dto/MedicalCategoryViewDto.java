package com.waad.tba.modules.medicalcategory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCategoryViewDto {
    private Long id;
    private String code;
    private String nameAr;
    private String nameEn;
    private String descriptionAr;
    private String descriptionEn;
    private Boolean active;
    private Integer servicesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
