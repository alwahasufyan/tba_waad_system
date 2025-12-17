package com.waad.tba.modules.preauth.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ChronicCondition Entity
 * Defines chronic medical conditions that require special handling and pre-approval.
 * Examples: Diabetes, Hypertension, Cancer, Kidney Disease, etc.
 */
@Entity
@Table(name = "chronic_conditions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ChronicCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Condition name is required")
    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(unique = true, length = 50)
    private String code;

    @Column(length = 2000)
    private String description;

    /**
     * If true, any service related to this condition requires pre-approval
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean requiresPreApproval = true;

    /**
     * Category for grouping conditions (e.g., CARDIOVASCULAR, ENDOCRINE, ONCOLOGY)
     */
    @Column(length = 100)
    private String category;

    /**
     * List of service codes typically associated with this condition
     * Stored as comma-separated values or JSON
     */
    @Column(length = 2000)
    private String associatedServiceCodes;

    @Column(length = 1000)
    private String notes;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
