package com.waad.tba.modules.medicalservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalServiceUpdateDto {
    
    @NotBlank(message = "Service code is required")
    private String code;
    
    @NotBlank(message = "Service name (Arabic) is required")
    private String nameAr;
    
    @NotBlank(message = "Service name (English) is required")
    private String nameEn;
    
    private String descriptionAr;
    private String descriptionEn;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @Positive(message = "Base price must be positive")
    private BigDecimal basePrice;
    
    private Boolean requiresApproval;
    private Boolean active;
}
