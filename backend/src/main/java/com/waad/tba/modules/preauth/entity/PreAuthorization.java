package com.waad.tba.modules.preauth.entity;

import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.rbac.entity.User;
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
@Table(name = "pre_authorizations", uniqueConstraints = {
    @UniqueConstraint(columnNames = "preAuthNumber", name = "uk_pre_auth_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PreAuthorization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Pre-authorization number is required")
    @Column(unique = true, nullable = false, length = 100)
    private String preAuthNumber;

    // Member who needs the service
    @NotNull(message = "Member is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // Provider (Hospital/Clinic) making the request
    @NotNull(message = "Provider ID is required")
    @Column(nullable = false)
    private Long providerId;

    @Column(length = 200)
    private String providerName;

    // Medical Information
    @NotBlank(message = "Diagnosis code is required")
    @Column(nullable = false, length = 20)
    private String diagnosisCode;

    @Column(length = 500)
    private String diagnosisDescription;

    // Procedure codes (comma-separated or JSON array)
    @Column(length = 2000)
    private String procedureCodes;

    @Column(length = 2000)
    private String procedureDescriptions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceType serviceType;

    // Cost Information
    @Column()
    private BigDecimal estimatedCost;

    @Column()
    private BigDecimal approvedAmount;

    // Doctor Information
    @Column(length = 200)
    private String doctorName;

    @Column(length = 100)
    private String doctorSpecialty;

    // Request Information
    @NotNull(message = "Request date is required")
    @Column(nullable = false)
    private LocalDate requestDate;

    @Column(nullable = false)
    private LocalDate expectedServiceDate;

    private LocalDate serviceFromDate;
    
    private LocalDate serviceToDate;

    private Integer numberOfDays;

    // Status and Approval
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private PreAuthStatus status = PreAuthStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    private LocalDateTime reviewedAt;

    private LocalDate approvalExpiryDate;

    // Notes and Attachments
    @Column(length = 3000)
    private String requestNotes;

    @Column(length = 3000)
    private String reviewerNotes;

    @Column(length = 2000)
    private String rejectionReason;

    // Attachments (URLs or file paths, comma-separated)
    @Column(length = 2000)
    private String attachments;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum PreAuthStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        PARTIALLY_APPROVED,
        REJECTED,
        EXPIRED,
        MORE_INFO_REQUIRED
    }

    public enum ServiceType {
        INPATIENT,
        OUTPATIENT,
        SURGERY,
        MATERNITY,
        EMERGENCY,
        DENTAL,
        OPTICAL,
        CHRONIC_DISEASE,
        OTHER
    }
}
