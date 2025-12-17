package com.waad.tba.modules.preauth.entity;

import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.visit.entity.Visit;
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

/**
 * PreApproval Entity
 * Handles all pre-approval requests including:
 * - Chronic condition approvals
 * - Exceed limit approvals
 * - Special VIP member approvals
 * - High-cost service approvals
 */
@Entity
@Table(name = "pre_approvals", uniqueConstraints = {
    @UniqueConstraint(columnNames = "approvalNumber", name = "uk_approval_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PreApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Approval number is required")
    @Column(unique = true, nullable = false, length = 100)
    private String approvalNumber;

    /**
     * Type of approval request
     */
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Approval type is required")
    @Column(nullable = false, length = 30)
    private ApprovalType type;

    // Member requesting the service
    @NotNull(message = "Member is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // Related visit (optional, may not exist yet)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    // Provider where service will be performed
    @NotNull(message = "Provider ID is required")
    @Column(nullable = false)
    private Long providerId;

    @Column(length = 200)
    private String providerName;

    // Service Information
    @Column(length = 50)
    private String serviceCode;

    @Column(length = 500)
    private String serviceDescription;

    @Column(length = 20)
    private String diagnosisCode;

    @Column(length = 500)
    private String diagnosisDescription;

    // Financial Information
    @NotNull(message = "Requested amount is required")
    @Column(nullable = false)
    private BigDecimal requestedAmount;

    @Column()
    private BigDecimal approvedAmount;

    @Column()
    private BigDecimal rejectedAmount;

    /**
     * Current available balance for member (at time of request)
     */
    @Column()
    private BigDecimal memberRemainingBalance;

    /**
     * Amount that exceeds the member's limit (if type = EXCEED_LIMIT)
     */
    @Column()
    private BigDecimal exceedAmount;

    // Status and Workflow
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ApprovalLevel requiredLevel;

    // Request Information
    @NotNull(message = "Request date is required")
    @Column(nullable = false)
    private LocalDate requestDate;

    @Column()
    private LocalDate expectedServiceDate;

    @Column(length = 2000)
    private String requestReason;

    // Review Information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_reviewer_id")
    private User medicalReviewer;

    private LocalDateTime medicalReviewedAt;

    @Column(length = 2000)
    private String medicalReviewNotes;

    // Manager Approval (for high amounts or special cases)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_approver_id")
    private User managerApprover;

    private LocalDateTime managerApprovedAt;

    @Column(length = 2000)
    private String managerNotes;

    // Chronic Condition Reference (if applicable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_chronic_condition_id")
    private MemberChronicCondition memberChronicCondition;

    // Approval Validity
    @Column()
    private LocalDate validFrom;

    @Column()
    private LocalDate validUntil;

    @Builder.Default
    @Column(nullable = false)
    private Boolean expired = false;

    // Rejection Information
    @Column(length = 2000)
    private String rejectionReason;

    // Auto Approval
    @Builder.Default
    @Column(nullable = false)
    private Boolean autoApproved = false;

    @Column(length = 500)
    private String autoApprovalRule;

    // Additional Information
    @Column(length = 2000)
    private String notes;

    @Column(length = 2000)
    private String attachments;

    // Created By (User who created the request - provider staff or TPA staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @NotNull(message = "Company ID is required")
    @Column(nullable = false)
    private Long companyId;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Approval Type Enum
     */
    public enum ApprovalType {
        CHRONIC_CONDITION,      // Member has chronic condition requiring approval
        EXCEED_LIMIT,           // Service cost exceeds member's remaining balance
        SPECIAL_VIP,            // Special approval for VIP members
        HIGH_COST_SERVICE,      // Service above certain threshold
        EXPERIMENTAL_TREATMENT, // Experimental or non-standard treatment
        OUT_OF_NETWORK,         // Provider not in network
        EMERGENCY_OVERRIDE,     // Emergency situation requiring override
        OTHER
    }

    /**
     * Approval Status Enum
     */
    public enum ApprovalStatus {
        PENDING,                // Waiting for review
        UNDER_MEDICAL_REVIEW,   // Medical reviewer is reviewing
        UNDER_MANAGER_REVIEW,   // Requires manager approval
        APPROVED,               // Fully approved
        PARTIALLY_APPROVED,     // Partially approved (less than requested)
        REJECTED,               // Rejected
        EXPIRED,                // Approval expired before use
        USED,                   // Already used in a claim
        CANCELLED               // Cancelled by requester
    }

    /**
     * Approval Level Required
     */
    public enum ApprovalLevel {
        AUTO,           // Can be auto-approved by system
        MEDICAL,        // Requires medical reviewer
        MANAGER,        // Requires manager approval
        DIRECTOR        // Requires director approval (very high amounts)
    }

    /**
     * Check if approval is currently valid
     */
    @Transient
    public boolean isCurrentlyValid() {
        if (!active || expired || status != ApprovalStatus.APPROVED) {
            return false;
        }
        
        LocalDate now = LocalDate.now();
        boolean afterStart = validFrom == null || !now.isBefore(validFrom);
        boolean beforeEnd = validUntil == null || !now.isAfter(validUntil);
        
        return afterStart && beforeEnd;
    }

    /**
     * Mark as expired if past validity date
     */
    public void checkAndMarkExpired() {
        if (validUntil != null && LocalDate.now().isAfter(validUntil)) {
            this.expired = true;
            if (this.status == ApprovalStatus.APPROVED) {
                this.status = ApprovalStatus.EXPIRED;
            }
        }
    }
}
