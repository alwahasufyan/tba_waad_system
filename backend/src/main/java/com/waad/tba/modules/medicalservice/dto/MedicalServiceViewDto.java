package com.waad.tba.modules.medicalservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    /**
     * Price in LYD - Phase D2.1: Aligned with frontend field name
     */
    private BigDecimal priceLyd;
    
    /**
     * Cost in LYD - Phase D2.1: Added for frontend compatibility
     */
    private BigDecimal costLyd;
    
    /**
     * @deprecated Use priceLyd instead
     */
    @Deprecated
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private BigDecimal basePrice;
    
    private Boolean requiresApproval;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Category object for nested response - Phase D2.1
     */
    private CategoryInfo category;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String nameAr;
        private String nameEn;
        private String code;
    }
}
