package com.waad.tba.modules.providercontract.entity;

import com.waad.tba.modules.medicalcategory.MedicalCategory;
import com.waad.tba.modules.medicalservice.MedicalService;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Provider Contract Pricing Item Entity - represents per-service pricing within a contract.
 * 
 * Business Rules:
 * - Each service can only appear once per contract (unique constraint)
 * - discount_percent is auto-calculated from base_price and contract_price
 * - Pricing items inherit contract's effective dates if not specified
 * - Read-only if parent contract is EXPIRED or TERMINATED
 * 
 * Maps to: provider_contract_pricing_items table
 * 
 * @version 1.0
 * @since 2024-12-24
 */
@Entity
@Table(name = "provider_contract_pricing_items", indexes = {
    @Index(name = "idx_pricing_contract_id", columnList = "contract_id"),
    @Index(name = "idx_pricing_service_id", columnList = "medical_service_id"),
    @Index(name = "idx_pricing_category_id", columnList = "medical_category_id"),
    @Index(name = "idx_pricing_active", columnList = "active")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_contract_service", columnNames = {"contract_id", "medical_service_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderContractPricingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Parent contract this pricing belongs to
     */
    @NotNull(message = "Contract is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private ProviderContract contract;

    /**
     * Medical service being priced
     */
    @NotNull(message = "Medical service is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_service_id", nullable = false)
    private MedicalService medicalService;

    /**
     * Optional category override (defaults to service's category)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_category_id")
    private MedicalCategory medicalCategory;

    /**
     * Standard/list price for this service
     */
    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.00", message = "Base price must be >= 0")
    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    /**
     * Negotiated contract price
     */
    @NotNull(message = "Contract price is required")
    @DecimalMin(value = "0.00", message = "Contract price must be >= 0")
    @Column(name = "contract_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal contractPrice;

    /**
     * Calculated discount percentage ((basePrice - contractPrice) / basePrice * 100)
     */
    @DecimalMin(value = "0.00", message = "Discount must be >= 0")
    @DecimalMax(value = "100.00", message = "Discount must be <= 100")
    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    /**
     * Unit of service (e.g., "visit", "test", "night")
     */
    @NotBlank(message = "Unit is required")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String unit = "service";

    /**
     * Currency code
     */
    @Size(max = 3)
    @Column(length = 3)
    @Builder.Default
    private String currency = "LYD";

    /**
     * Date this pricing becomes effective (overrides contract date)
     */
    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    /**
     * Date this pricing expires (overrides contract date)
     */
    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    /**
     * Additional notes about this pricing
     */
    @Size(max = 2000)
    @Column(length = 2000)
    private String notes;

    /**
     * Soft delete flag
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // ═══════════════════════════════════════════════════════════════════════════
    // AUDIT FIELDS
    // ═══════════════════════════════════════════════════════════════════════════

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Size(max = 100)
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Size(max = 100)
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // ═══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Auto-calculate discount percent before persist/update
     */
    @PrePersist
    @PreUpdate
    public void calculateDiscountPercent() {
        if (basePrice != null && contractPrice != null && basePrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discount = basePrice.subtract(contractPrice)
                    .divide(basePrice, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
            
            // Ensure discount is within bounds
            if (discount.compareTo(BigDecimal.ZERO) < 0) {
                discount = BigDecimal.ZERO;
            } else if (discount.compareTo(BigDecimal.valueOf(100)) > 0) {
                discount = BigDecimal.valueOf(100);
            }
            
            this.discountPercent = discount;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Check if this pricing is currently effective
     */
    public boolean isCurrentlyEffective() {
        LocalDate today = LocalDate.now();
        
        // Use item-specific dates if available, otherwise use contract dates
        LocalDate effectiveStart = effectiveFrom != null ? effectiveFrom : 
                (contract != null ? contract.getStartDate() : null);
        LocalDate effectiveEnd = effectiveTo != null ? effectiveTo : 
                (contract != null ? contract.getEndDate() : null);
        
        if (effectiveStart == null) {
            return false;
        }
        
        return !effectiveStart.isAfter(today) && 
               (effectiveEnd == null || !effectiveEnd.isBefore(today));
    }

    /**
     * Get the savings amount (basePrice - contractPrice)
     */
    public BigDecimal getSavingsAmount() {
        if (basePrice == null || contractPrice == null) {
            return BigDecimal.ZERO;
        }
        return basePrice.subtract(contractPrice);
    }

    /**
     * Get effective category (from item or from service)
     */
    public MedicalCategory getEffectiveCategory() {
        if (medicalCategory != null) {
            return medicalCategory;
        }
        return medicalService != null ? medicalService.getCategoryEntity() : null;
    }
}
