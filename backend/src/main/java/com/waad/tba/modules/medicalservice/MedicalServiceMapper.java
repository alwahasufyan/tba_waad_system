package com.waad.tba.modules.medicalservice;

import java.math.BigDecimal;

import com.waad.tba.modules.medicalcategory.MedicalCategory;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceCreateDto;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceSelectorDto;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceUpdateDto;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceViewDto;

/**
 * Mapper for MedicalService Entity
 * 
 * Entity Fields (MedicalService.java):
 * - id: Long
 * - code: String (required)
 * - nameAr: String (required)
 * - nameEn: String (optional)
 * - category: String (deprecated)
 * - categoryEntity: MedicalCategory (ManyToOne)
 * - priceLyd: Double (required) - WARNING: Entity uses Double, DTOs use BigDecimal
 * - costLyd: Double (optional)
 * - createdAt: LocalDateTime (Phase D2.1)
 * - updatedAt: LocalDateTime (Phase D2.1)
 * - categoryId: Long (transient)
 * - categoryNameAr: String (transient)
 * - categoryNameEn: String (transient)
 * 
 * NOT AVAILABLE IN ENTITY:
 * - descriptionAr, descriptionEn
 * - requiresApproval, active
 */
public class MedicalServiceMapper {

    /**
     * Convert Entity to ViewDto
     * Maps only fields that exist in Entity
     * Phase D2.1: Added priceLyd, costLyd, category object for frontend compatibility
     */
    public static MedicalServiceViewDto toViewDto(MedicalService entity) {
        if (entity == null) return null;
        
        // Build category info object
        MedicalServiceViewDto.CategoryInfo categoryInfo = null;
        if (entity.getCategoryEntity() != null) {
            categoryInfo = MedicalServiceViewDto.CategoryInfo.builder()
                    .id(entity.getCategoryEntity().getId())
                    .nameAr(entity.getCategoryEntity().getNameAr())
                    .nameEn(entity.getCategoryEntity().getNameEn())
                    .code(entity.getCategoryEntity().getCode())
                    .build();
        }
        
        return MedicalServiceViewDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                // descriptionAr, descriptionEn: Not available in entity, return null
                .descriptionAr(null)
                .descriptionEn(null)
                // Category fields - flat and nested
                .categoryId(entity.getCategoryEntity() != null ? entity.getCategoryEntity().getId() : null)
                .categoryNameAr(entity.getCategoryEntity() != null ? entity.getCategoryEntity().getNameAr() : null)
                .categoryNameEn(entity.getCategoryEntity() != null ? entity.getCategoryEntity().getNameEn() : null)
                .category(categoryInfo)
                // Phase D2.1: Price fields aligned with frontend
                .priceLyd(entity.getPriceLyd() != null ? BigDecimal.valueOf(entity.getPriceLyd()) : null)
                .costLyd(entity.getCostLyd() != null ? BigDecimal.valueOf(entity.getCostLyd()) : null)
                .basePrice(entity.getPriceLyd() != null ? BigDecimal.valueOf(entity.getPriceLyd()) : null) // deprecated
                // requiresApproval, active: Not available in entity, return defaults
                .requiresApproval(false)
                .active(true)
                // Phase D2.1: Map createdAt and updatedAt from entity
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert Entity to SelectorDto (for dropdowns)
     */
    public static MedicalServiceSelectorDto toSelectorDto(MedicalService entity) {
        if (entity == null) return null;
        
        return MedicalServiceSelectorDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                .build();
    }

    /**
     * Convert CreateDto to Entity
     * WARNING: Ignores fields not available in entity (descriptionAr, descriptionEn, requiresApproval, active)
     * Phase D2.1: Uses getEffectivePrice() for backward compatibility
     */
    public static MedicalService toEntity(MedicalServiceCreateDto dto, MedicalCategory category) {
        if (dto == null) return null;
        
        BigDecimal effectivePrice = dto.getEffectivePrice();
        BigDecimal effectiveCost = dto.getCostLyd();
        
        return MedicalService.builder()
                .code(dto.getCode())
                .nameAr(dto.getNameAr())
                .nameEn(dto.getNameEn())
                .categoryEntity(category)
                // Phase D2.1: Use effective price (supports both priceLyd and basePrice)
                .priceLyd(effectivePrice != null ? effectivePrice.doubleValue() : 0.0)
                .costLyd(effectiveCost != null ? effectiveCost.doubleValue() : 0.0)
                // Ignored DTO fields (not in entity): descriptionAr, descriptionEn, requiresApproval, active
                .build();
    }

    /**
     * Update existing Entity from UpdateDto
     * WARNING: Ignores fields not available in entity (descriptionAr, descriptionEn, requiresApproval, active)
     * Phase D2.1: Uses getEffectivePrice() for backward compatibility
     */
    public static void updateEntity(MedicalService entity, MedicalServiceUpdateDto dto, MedicalCategory category) {
        if (entity == null || dto == null) return;
        
        entity.setCode(dto.getCode());
        entity.setNameAr(dto.getNameAr());
        entity.setNameEn(dto.getNameEn());
        entity.setCategoryEntity(category);
        
        // Phase D2.1: Use effective price (supports both priceLyd and basePrice)
        BigDecimal effectivePrice = dto.getEffectivePrice();
        if (effectivePrice != null) {
            entity.setPriceLyd(effectivePrice.doubleValue());
        }
        
        // Phase D2.1: Update cost if provided
        if (dto.getCostLyd() != null) {
            entity.setCostLyd(dto.getCostLyd().doubleValue());
        }
        // Ignored DTO fields (not in entity): descriptionAr, descriptionEn, requiresApproval, active
    }
}
