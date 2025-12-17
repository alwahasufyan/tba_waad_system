package com.waad.tba.modules.policy.entity;

import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policies", uniqueConstraints = {
    @UniqueConstraint(columnNames = "policyNumber", name = "uk_policy_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Policy number is required")
    @Column(nullable = false, unique = true, length = 100)
    private String policyNumber;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String productName;

    @NotNull(message = "Start date is required")
    @Column(nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(nullable = false)
    private LocalDate endDate;

    @NotNull(message = "Employer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @NotNull(message = "Insurance company is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_company_id", nullable = false)
    private InsuranceCompany insuranceCompany;

    @NotNull(message = "Benefit package is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "benefit_package_id", nullable = false)
    private BenefitPackage benefitPackage;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    // Waiting Periods (in days)
    @Builder.Default
    @Column(nullable = false)
    private Integer generalWaitingPeriodDays = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer maternityWaitingPeriodDays = 270;

    @Builder.Default
    @Column(nullable = false)
    private Integer preExistingWaitingPeriodDays = 365;

    // Coverage Limits
    @Column()
    private BigDecimal totalPolicyLimit;

    @Column()
    private BigDecimal perMemberLimit;

    @Column()
    private BigDecimal perFamilyLimit;

    // Premium Information
    @Column()
    private BigDecimal totalPremium;

    @Column()
    private BigDecimal premiumPerMember;

    // Policy Details
    @Column(nullable = false)
    private Integer numberOfLives;

    @Column(nullable = false)
    private Integer numberOfFamilies;

    // Exclusions (comma-separated or JSON)
    @Column(length = 3000)
    private String exclusions;

    // Special Conditions
    @Column(length = 3000)
    private String specialConditions;

    @Column(length = 2000)
    private String notes;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum PolicyStatus {
        PENDING,
        ACTIVE,
        SUSPENDED,
        EXPIRED,
        CANCELLED,
        RENEWAL_PENDING
    }
}
