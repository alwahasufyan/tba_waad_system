package com.waad.tba.modules.medicalcategory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCategorySelectorDto {
    private Long id;
    private String code;
    private String nameAr;
    private String nameEn;
}
