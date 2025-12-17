package com.waad.tba.modules.medicalservice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.waad.tba.modules.medicalcategory.MedicalCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medical_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // مرجع داخلي

    @Column(nullable = false)
    private String nameAr; // الاسم بالعربي

    private String nameEn; // الاسم بالإنجليزي

    /**
     * @deprecated Use category relationship instead
     * Kept for backward compatibility
     */
    @Deprecated
    @Column
    private String category; // تحليل، أشعة، عمليات...

    /**
     * Many-to-One relationship with MedicalCategory
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnore // Prevent circular reference in JSON
    private MedicalCategory categoryEntity;

    @Column(nullable = false)
    private Double priceLyd; // السعر بالدينار

    private Double costLyd; // اختياري

    // Transient fields for frontend compatibility
    @Transient
    private Long categoryId;

    @Transient
    private String categoryNameAr;

    @Transient
    private String categoryNameEn;

    /**
     * Post-load callback to populate transient fields
     */
    @PostLoad
    private void populateCategoryFields() {
        if (categoryEntity != null) {
            this.categoryId = categoryEntity.getId();
            this.categoryNameAr = categoryEntity.getNameAr();
            this.categoryNameEn = categoryEntity.getNameEn();
        }
    }
}
