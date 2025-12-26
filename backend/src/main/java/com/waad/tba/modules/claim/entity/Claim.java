package com.waad.tba.modules.claim.entity;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.insurancepolicy.entity.InsurancePolicy;
import com.waad.tba.modules.insurancepolicy.entity.PolicyBenefitPackage;
import com.waad.tba.modules.preauth.entity.PreApproval;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // NEW: Organization-based relationship (canonical)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_org_id", nullable = false)
    private Organization insuranceOrganization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_policy_id")
    private InsurancePolicy insurancePolicy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "benefit_package_id")
    private PolicyBenefitPackage benefitPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pre_approval_id")
    private PreApproval preApproval;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClaimLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClaimAttachment> attachments = new ArrayList<>();

    @Column(name = "provider_name", length = 255)
    private String providerName;

    @Column(name = "doctor_name", length = 255)
    private String doctorName;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Column(name = "requested_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal requestedAmount;

    @Column(name = "approved_amount", precision = 15, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "difference_amount", precision = 15, scale = 2)
    private BigDecimal differenceAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.DRAFT;

    @Column(name = "reviewer_comment", columnDefinition = "TEXT")
    private String reviewerComment;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // ========== Financial Snapshot Fields (Phase MVP) ==========
    
    /**
     * نسبة تحمل المريض (Co-Pay + Deductible)
     */
    @Column(name = "patient_copay", precision = 15, scale = 2)
    private BigDecimal patientCoPay;
    
    /**
     * المبلغ الصافي المستحق لمقدم الخدمة
     */
    @Column(name = "net_provider_amount", precision = 15, scale = 2)
    private BigDecimal netProviderAmount;
    
    /**
     * نسبة المشاركة المُطبقة (%)
     */
    @Column(name = "copay_percent", precision = 5, scale = 2)
    private BigDecimal coPayPercent;
    
    /**
     * الخصم المُطبق (Deductible)
     */
    @Column(name = "deductible_applied", precision = 15, scale = 2)
    private BigDecimal deductibleApplied;

    // ========== Settlement Fields (Phase MVP) ==========
    
    /**
     * رقم مرجع الدفع
     */
    @Column(name = "payment_reference", length = 100)
    private String paymentReference;
    
    /**
     * تاريخ التسوية
     */
    @Column(name = "settled_at")
    private LocalDateTime settledAt;
    
    /**
     * ملاحظات التسوية
     */
    @Column(name = "settlement_notes", columnDefinition = "TEXT")
    private String settlementNotes;

    @Column(name = "service_count")
    private Integer serviceCount;

    @Column(name = "attachments_count")
    private Integer attachmentsCount;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        validateBusinessRules();
        calculateFields();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        validateBusinessRules();
        calculateFields();
    }

    private void validateBusinessRules() {
        if (requestedAmount == null || requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Requested amount must be greater than zero");
        }

        if (approvedAmount != null && approvedAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Approved amount cannot be negative");
        }

        if (status == ClaimStatus.APPROVED || status == ClaimStatus.SETTLED) {
            if (approvedAmount == null || approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Approved/Settled status requires approved amount greater than zero");
            }
        }

        // Note: Partial approval is now just APPROVED with approvedAmount < requestedAmount
        // The difference is tracked via differenceAmount field

        if (status == ClaimStatus.REJECTED) {
            if (reviewerComment == null || reviewerComment.trim().isEmpty()) {
                throw new IllegalStateException("Rejected status requires reviewer comment");
            }
        }

        // Auto-set reviewedAt when status changes from draft states
        if (status != null && status.requiresReviewerAction() && reviewedAt == null) {
            reviewedAt = LocalDateTime.now();
        }
    }

    private void calculateFields() {
        // Calculate difference amount
        if (requestedAmount != null && approvedAmount != null) {
            differenceAmount = requestedAmount.subtract(approvedAmount);
        } else {
            differenceAmount = null;
        }

        // Calculate service count
        serviceCount = (lines != null) ? lines.size() : 0;

        // Calculate attachments count
        attachmentsCount = (attachments != null) ? attachments.size() : 0;
    }

    // Helper methods for bidirectional relationships
    public void addLine(ClaimLine line) {
        lines.add(line);
        line.setClaim(this);
    }

    public void removeLine(ClaimLine line) {
        lines.remove(line);
        line.setClaim(null);
    }

    public void addAttachment(ClaimAttachment attachment) {
        attachments.add(attachment);
        attachment.setClaim(this);
    }

    public void removeAttachment(ClaimAttachment attachment) {
        attachments.remove(attachment);
        attachment.setClaim(null);
    }
}
