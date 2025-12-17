package com.waad.tba.modules.medicalcategory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCategoryUpdateDto {
    
    @NotBlank(message = "Category code is required")
    private String code;
    
    @NotBlank(message = "Category name (Arabic) is required")
    private String nameAr;
    
    @NotBlank(message = "Category name (English) is required")
    private String nameEn;
    
    private String descriptionAr;
    private String descriptionEn;
    private Boolean active;
}
