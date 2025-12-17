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
 * - categoryId: Long (transient)
 * - categoryNameAr: String (transient)
 * - categoryNameEn: String (transient)
 * 
 * NOT AVAILABLE IN ENTITY:
 * - descriptionAr, descriptionEn
 * - requiresApproval, active
 * - createdAt, updatedAt
 */
public class MedicalServiceMapper {

    /**
     * Convert Entity to ViewDto
     * Maps only fields that exist in Entity
     */
    public static MedicalServiceViewDto toViewDto(MedicalService entity) {
        if (entity == null) return null;
        
        return MedicalServiceViewDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                // descriptionAr, descriptionEn: Not available in entity, return null
                .descriptionAr(null)
                .descriptionEn(null)
                // Category fields
                .categoryId(entity.getCategoryEntity() != null ? entity.getCategoryEntity().getId() : null)
                .categoryNameAr(entity.getCategoryEntity() != null ? entity.getCategoryEntity().getNameAr() : null)
                .categoryNameEn(entity.getCategoryEntity() != null ? entity.getCategoryEntity().getNameEn() : null)
                // Price: Convert Double to BigDecimal
                .basePrice(entity.getPriceLyd() != null ? BigDecimal.valueOf(entity.getPriceLyd()) : null)
                // requiresApproval, active: Not available in entity, return defaults
                .requiresApproval(false)
                .active(true)
                // createdAt, updatedAt: Not available in entity, return null
                .createdAt(null)
                .updatedAt(null)
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
     */
    public static MedicalService toEntity(MedicalServiceCreateDto dto, MedicalCategory category) {
        if (dto == null) return null;
        
        return MedicalService.builder()
                .code(dto.getCode())
                .nameAr(dto.getNameAr())
                .nameEn(dto.getNameEn())
                .categoryEntity(category)
                // Convert BigDecimal to Double
                .priceLyd(dto.getBasePrice() != null ? dto.getBasePrice().doubleValue() : 0.0)
                .costLyd(0.0) // Default value
                // Ignored DTO fields (not in entity): descriptionAr, descriptionEn, requiresApproval, active
                .build();
    }

    /**
     * Update existing Entity from UpdateDto
     * WARNING: Ignores fields not available in entity (descriptionAr, descriptionEn, requiresApproval, active)
     */
    public static void updateEntity(MedicalService entity, MedicalServiceUpdateDto dto, MedicalCategory category) {
        if (entity == null || dto == null) return;
        
        entity.setCode(dto.getCode());
        entity.setNameAr(dto.getNameAr());
        entity.setNameEn(dto.getNameEn());
        entity.setCategoryEntity(category);
        // Convert BigDecimal to Double
        entity.setPriceLyd(dto.getBasePrice() != null ? dto.getBasePrice().doubleValue() : entity.getPriceLyd());
        // Ignored DTO fields (not in entity): descriptionAr, descriptionEn, requiresApproval, active
    }
}
