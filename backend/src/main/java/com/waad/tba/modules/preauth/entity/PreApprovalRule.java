package com.waad.tba.modules.preauth.entity;

import com.waad.tba.modules.provider.entity.Provider;
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

/**
 * PreApprovalRule Entity
 * Defines rules for when pre-approval is required.
 * Rules can be based on:
 * - Service codes
 * - Chronic conditions
 * - Provider types
 * - Cost thresholds
 */
@Entity
@Table(name = "pre_approval_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PreApprovalRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Rule name is required")
    @Column(nullable = false, length = 200)
    private String ruleName;

    @Column(length = 1000)
    private String description;

    /**
     * Service code that triggers this rule
     * Can be specific (e.g., "CPT-12345") or pattern (e.g., "CPT-123*")
     */
    @Column(length = 100)
    private String serviceCode;

    @Column(length = 500)
    private String serviceDescription;

    /**
     * If true, this rule only applies to members with chronic conditions
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean chronicOnly = false;

    /**
     * Specific chronic condition this rule applies to
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chronic_condition_id")
    private ChronicCondition chronicCondition;

    /**
     * Provider type this rule applies to
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Provider.ProviderType providerType;

    /**
     * Minimum amount that triggers this rule
     * If service cost >= minAmount, pre-approval is required
     */
    @Column()
    private BigDecimal minAmount;

    /**
     * Maximum amount that can be auto-approved
     * If cost > maxAutoApproveAmount, requires manager review
     */
    @Column()
    private BigDecimal maxAutoApproveAmount;

    /**
     * Whether this rule requires manager review (not just medical reviewer)
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean requiresManagerReview = false;

    /**
     * Approval level required for this rule
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PreApproval.ApprovalLevel requiredApprovalLevel;

    /**
     * Priority of this rule (higher priority rules are evaluated first)
     */
    @Builder.Default
    @Column(nullable = false)
    private Integer priority = 0;

    /**
     * Category for grouping rules
     */
    @Column(length = 100)
    private String category;

    /**
     * Whether this rule allows auto-approval under certain conditions
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean allowAutoApproval = false;

    /**
     * Conditions for auto-approval (JSON format)
     * Example: {"memberType":"VIP", "amountBelow":5000}
     */
    @Column(length = 2000)
    private String autoApprovalConditions;

    /**
     * Standard approval validity period in days
     */
    @Builder.Default
    @Column()
    private Integer validityDays = 30;

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

    /**
     * Check if this rule matches the given criteria
     */
    @Transient
    public boolean matchesCriteria(String serviceCode, Provider.ProviderType providerType, 
                                   BigDecimal amount, boolean hasChronic) {
        // Check if rule is active
        if (!active) {
            return false;
        }

        // Check chronic condition requirement
        if (chronicOnly && !hasChronic) {
            return false;
        }

        // Check service code match
        if (this.serviceCode != null && serviceCode != null) {
            if (this.serviceCode.endsWith("*")) {
                String pattern = this.serviceCode.substring(0, this.serviceCode.length() - 1);
                if (!serviceCode.startsWith(pattern)) {
                    return false;
                }
            } else if (!this.serviceCode.equals(serviceCode)) {
                return false;
            }
        }

        // Check provider type match
        if (this.providerType != null && providerType != null 
            && this.providerType != providerType) {
            return false;
        }

        // Check minimum amount
        if (minAmount != null && amount != null && amount.compareTo(minAmount) < 0) {
            return false;
        }

        return true;
    }
}
