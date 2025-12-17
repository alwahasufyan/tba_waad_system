package com.waad.tba.modules.member.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import com.waad.tba.modules.policy.entity.Policy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "members", uniqueConstraints = {
    @UniqueConstraint(columnNames = "civilId", name = "uk_member_civil_id"),
    @UniqueConstraint(columnNames = "cardNumber", name = "uk_member_card_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relations
    @NotNull(message = "Employer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id")
    private Policy policy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_company_id")
    private InsuranceCompany insuranceCompany;

    // Personal Information
    @NotBlank(message = "Full name in Arabic is required")
    @Column(nullable = false, length = 200, name = "full_name_arabic")
    private String fullNameArabic;

    @Column(length = 200, name = "full_name_english")
    private String fullNameEnglish;

    @NotBlank(message = "Civil ID (National ID) is required")
    @Column(unique = true, nullable = false, length = 50, name = "civil_id")
    private String civilId;

    @Column(unique = true, length = 50, name = "card_number")
    private String cardNumber;

    @NotNull(message = "Date of birth is required")
    @Column(nullable = false, name = "birth_date")
    private LocalDate birthDate;
    
    @NotNull(message = "Gender is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, name = "marital_status")
    private MaritalStatus maritalStatus;
    
    @Column(length = 20)
    private String phone;
    
    @Email(message = "Invalid email format")
    @Column(length = 255)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String nationality;

    // Insurance Information
    @Column(length = 100, name = "policy_number")
    private String policyNumber;

    @Column(name = "benefit_package_id")
    private Long benefitPackageId;

    // Employment Information
    @Column(length = 100, name = "employee_number")
    private String employeeNumber;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(length = 100)
    private String occupation;

    // Membership Status
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20, name = "card_status")
    private CardStatus cardStatus = CardStatus.ACTIVE;

    @Column(length = 500, name = "blocked_reason")
    private String blockedReason;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    // QR Code & Eligibility
    @Column(unique = true, length = 100, name = "qr_code_value")
    private String qrCodeValue;

    @Builder.Default
    @Column(nullable = false, name = "eligibility_status")
    private Boolean eligibilityStatus = true;

    @Column(name = "eligibility_updated_at")
    private LocalDateTime eligibilityUpdatedAt;

    // Additional Information
    @Column(length = 500, name = "photo_url")
    private String photoUrl;

    @Column(length = 2000)
    private String notes;

    // Audit fields
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @CreatedDate
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Computed field for full name
    @Transient
    public String getFullName() {
        return fullNameArabic != null ? fullNameArabic : fullNameEnglish;
    }

    // Enums
    public enum Gender {
        MALE, FEMALE
    }

    public enum MaritalStatus {
        SINGLE, MARRIED, DIVORCED, WIDOWED
    }

    public enum MemberStatus {
        ACTIVE, SUSPENDED, TERMINATED, PENDING
    }

    public enum CardStatus {
        ACTIVE, INACTIVE, BLOCKED, EXPIRED
    }
}
