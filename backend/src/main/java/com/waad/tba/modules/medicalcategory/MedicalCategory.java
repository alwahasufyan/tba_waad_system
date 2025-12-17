package com.waad.tba.modules.medicalcategory;

import com.waad.tba.modules.medicalservice.MedicalService;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Medical Category Entity
 * Represents categories for medical services in TPA system
 * Examples: Lab Tests, Radiology, Dental, Surgery, Emergency, OP, IP, Consultation, Pathology, Procedures
 */
@Entity
@Table(name = "medical_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique category code (e.g., LAB, RAD, DENT, SURG, EMER, OP, IP, CONS, PATH, PROC)
     */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    /**
     * Category name in Arabic
     */
    @Column(nullable = false, length = 200)
    private String nameAr;

    /**
     * Category name in English
     */
    @Column(nullable = false, length = 200)
    private String nameEn;

    /**
     * Category description
     */
    @Column(length = 500)
    private String description;

    /**
     * Medical services belonging to this category
     */
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MedicalService> medicalServices = new ArrayList<>();

    /**
     * Creation timestamp
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Last update timestamp
     */
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Convenience method to add medical service to category
     */
    public void addMedicalService(MedicalService service) {
        medicalServices.add(service);
        service.setCategoryEntity(this);
    }

    /**
     * Convenience method to remove medical service from category
     */
    public void removeMedicalService(MedicalService service) {
        medicalServices.remove(service);
        service.setCategoryEntity(null);
    }
}
