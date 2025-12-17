package com.waad.tba.modules.medicalcategory;

import com.waad.tba.modules.medicalcategory.dto.MedicalCategoryCreateDto;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategorySelectorDto;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategoryUpdateDto;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategoryViewDto;

/**
 * Mapper for MedicalCategory Entity
 * 
 * Entity Fields (MedicalCategory.java):
 * - id: Long
 * - code: String (unique, required)
 * - nameAr: String (required)
 * - nameEn: String (required)
 * - description: String (single field, not separated by language)
 * - medicalServices: List<MedicalService> (OneToMany)
 * - createdAt: LocalDateTime
 * - updatedAt: LocalDateTime
 * 
 * NOT AVAILABLE IN ENTITY:
 * - descriptionAr, descriptionEn (separate fields) - Entity has only 'description'
 * - active (boolean)
 * 
 * DTOs have separate descriptionAr/descriptionEn fields
 * Mapper strategy: Use 'description' field for both (prefer Arabic if available)
 */
public class MedicalCategoryMapper {

    /**
     * Convert Entity to ViewDto
     * Maps description to both descriptionAr and descriptionEn
     */
    public static MedicalCategoryViewDto toViewDto(MedicalCategory entity) {
        if (entity == null) return null;
        
        return MedicalCategoryViewDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                // Map single description to both Ar and En fields
                .descriptionAr(entity.getDescription())
                .descriptionEn(entity.getDescription())
                // active: Not available in entity, return default
                .active(true)
                .servicesCount(entity.getMedicalServices() != null ? entity.getMedicalServices().size() : 0)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert Entity to SelectorDto (for dropdowns)
     */
    public static MedicalCategorySelectorDto toSelectorDto(MedicalCategory entity) {
        if (entity == null) return null;
        
        return MedicalCategorySelectorDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                .build();
    }

    /**
     * Convert CreateDto to Entity
     * Uses descriptionAr if available, falls back to descriptionEn
     * WARNING: Entity only has single 'description' field
     */
    public static MedicalCategory toEntity(MedicalCategoryCreateDto dto) {
        if (dto == null) return null;
        
        // Prefer Arabic description, fallback to English
        String description = dto.getDescriptionAr() != null && !dto.getDescriptionAr().isEmpty() 
            ? dto.getDescriptionAr() 
            : dto.getDescriptionEn();
        
        return MedicalCategory.builder()
                .code(dto.getCode())
                .nameAr(dto.getNameAr())
                .nameEn(dto.getNameEn())
                .description(description)
                // Ignored DTO field (not in entity): active
                .build();
    }

    /**
     * Update existing Entity from UpdateDto
     * Uses descriptionAr if available, falls back to descriptionEn
     * WARNING: Entity only has single 'description' field
     */
    public static void updateEntity(MedicalCategory entity, MedicalCategoryUpdateDto dto) {
        if (entity == null || dto == null) return;
        
        // Prefer Arabic description, fallback to English
        String description = dto.getDescriptionAr() != null && !dto.getDescriptionAr().isEmpty() 
            ? dto.getDescriptionAr() 
            : dto.getDescriptionEn();
        
        entity.setCode(dto.getCode());
        entity.setNameAr(dto.getNameAr());
        entity.setNameEn(dto.getNameEn());
        entity.setDescription(description);
        // Ignored DTO field (not in entity): active
    }
}
