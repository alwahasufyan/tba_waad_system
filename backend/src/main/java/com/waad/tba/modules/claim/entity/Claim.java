package com.waad.tba.modules.claim.entity;

import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_company_id", nullable = false)
    private InsuranceCompany insuranceCompany;

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
    private ClaimStatus status = ClaimStatus.PENDING_REVIEW;

    @Column(name = "reviewer_comment", columnDefinition = "TEXT")
    private String reviewerComment;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

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

        if (status == ClaimStatus.APPROVED) {
            if (approvedAmount == null || approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Approved status requires approved amount greater than zero");
            }
        }

        if (status == ClaimStatus.PARTIALLY_APPROVED) {
            if (approvedAmount == null || approvedAmount.compareTo(requestedAmount) >= 0) {
                throw new IllegalStateException("Partially approved status requires approved amount less than requested amount");
            }
        }

        if (status == ClaimStatus.REJECTED) {
            if (reviewerComment == null || reviewerComment.trim().isEmpty()) {
                throw new IllegalStateException("Rejected status requires reviewer comment");
            }
        }

        // Auto-set reviewedAt when status is not PENDING_REVIEW
        if (status != null && status != ClaimStatus.PENDING_REVIEW && reviewedAt == null) {
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
