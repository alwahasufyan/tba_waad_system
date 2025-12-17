package com.waad.tba.modules.preauth.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.waad.tba.modules.member.entity.Member;

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
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MemberChronicCondition Entity
 * Links members to their chronic conditions with special limits and overrides.
 * Allows granting extra coverage limits for chronic members.
 */
@Entity
@Table(name = "member_chronic_conditions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"member_id", "chronic_condition_id"}, 
                      name = "uk_member_chronic_condition")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MemberChronicCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Member is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @NotNull(message = "Chronic condition is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chronic_condition_id", nullable = false)
    private ChronicCondition chronicCondition;

    /**
     * Date when the condition was diagnosed
     */
    @NotNull(message = "Diagnosis date is required")
    @Column(nullable = false)
    private LocalDate diagnosisDate;

    /**
     * Extra coverage limit granted for this specific condition
     * This is added on top of the regular policy limit
     */
    @Column()
    private BigDecimal extraLimit;

    /**
     * Amount already used from the extra limit
     */
    @Builder.Default
    @Column()
    private BigDecimal extraLimitUsed = BigDecimal.ZERO;

    /**
     * Validity period for this chronic condition coverage
     */
    @Column()
    private LocalDate validFrom;

    @Column()
    private LocalDate validUntil;

    /**
     * Severity level (MILD, MODERATE, SEVERE, CRITICAL)
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Severity severity;

    /**
     * Whether this member requires mandatory pre-approval for ALL services
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean requiresMandatoryPreApproval = false;

    /**
     * Special notes about this member's condition
     */
    @Column(length = 2000)
    private String notes;

    /**
     * Reference to supporting documents
     */
    @Column(length = 1000)
    private String attachments;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Severity {
        MILD,
        MODERATE,
        SEVERE,
        CRITICAL
    }

    /**
     * Calculate remaining extra limit
     */
    @Transient
    public BigDecimal getRemainingExtraLimit() {
        if (extraLimit == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal used = extraLimitUsed != null ? extraLimitUsed : BigDecimal.ZERO;
        return extraLimit.subtract(used);
    }

    /**
     * Check if this chronic condition coverage is currently valid
     */
    @Transient
    public boolean isCurrentlyValid() {
        LocalDate now = LocalDate.now();
        boolean afterStart = validFrom == null || !now.isBefore(validFrom);
        boolean beforeEnd = validUntil == null || !now.isAfter(validUntil);
        return active && afterStart && beforeEnd;
    }
}
