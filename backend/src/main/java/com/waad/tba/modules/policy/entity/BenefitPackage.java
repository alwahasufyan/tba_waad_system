package com.waad.tba.modules.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "benefit_packages", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code", name = "uk_benefit_package_code")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class BenefitPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Benefit package code is required")
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank(message = "Benefit package name (Arabic) is required")
    @Column(nullable = false)
    private String nameAr;

    @NotBlank(message = "Benefit package name (English) is required")
    @Column(nullable = false)
    private String nameEn;

    @Column(length = 1000)
    private String description;

    // Outpatient (OP) Coverage
    @Column()
    private BigDecimal opCoverageLimit;

    @Column()
    private BigDecimal opCoPaymentPercentage;

    // Inpatient (IP) Coverage
    @Column()
    private BigDecimal ipCoverageLimit;

    @Column()
    private BigDecimal ipCoPaymentPercentage;

    // Maternity Coverage
    @Builder.Default
    @Column(nullable = false)
    private Boolean maternityCovered = false;

    @Column()
    private BigDecimal maternityCoverageLimit;

    // Dental Coverage
    @Builder.Default
    @Column(nullable = false)
    private Boolean dentalCovered = false;

    @Column()
    private BigDecimal dentalCoverageLimit;

    // Optical Coverage
    @Builder.Default
    @Column(nullable = false)
    private Boolean opticalCovered = false;

    @Column()
    private BigDecimal opticalCoverageLimit;

    // Pharmacy Coverage
    @Builder.Default
    @Column(nullable = false)
    private Boolean pharmacyCovered = true;

    @Column()
    private BigDecimal pharmacyCoverageLimit;

    // Annual Limits
    @Column()
    private BigDecimal annualLimitPerMember;

    @Column()
    private BigDecimal lifetimeLimitPerMember;

    // Emergency Coverage
    @Builder.Default
    @Column(nullable = false)
    private Boolean emergencyCovered = true;

    // Chronic Disease Coverage
    @Builder.Default
    @Column(nullable = false)
    private Boolean chronicDiseaseCovered = false;

    // Pre-existing Conditions
    @Builder.Default
    @Column(nullable = false)
    private Boolean preExistingConditionsCovered = false;

    // Limit Rules (JSON format for complex rules)
    @Column(length = 5000)
    private String limitRulesJson;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
