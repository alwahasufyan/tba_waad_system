package com.waad.tba.modules.medicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalServiceViewDto {
    private Long id;
    private String code;
    private String nameAr;
    private String nameEn;
    private String descriptionAr;
    private String descriptionEn;
    private Long categoryId;
    private String categoryNameAr;
    private String categoryNameEn;
    private BigDecimal basePrice;
    private Boolean requiresApproval;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
