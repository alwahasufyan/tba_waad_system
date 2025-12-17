package com.waad.tba.modules.policy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDto {

    private Long id;

    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Employer ID is required")
    private Long employerId;
    private String employerName;

    @NotNull(message = "Insurance company ID is required")
    private Long insuranceCompanyId;
    private String insuranceCompanyName;

    @NotNull(message = "Benefit package ID is required")
    private Long benefitPackageId;
    private String benefitPackageName;

    @Builder.Default
    private String status = "ACTIVE";

    @Builder.Default
    private Integer generalWaitingPeriodDays = 0;

    @Builder.Default
    private Integer maternityWaitingPeriodDays = 270;

    @Builder.Default
    private Integer preExistingWaitingPeriodDays = 365;

    private BigDecimal totalPolicyLimit;
    private BigDecimal perMemberLimit;
    private BigDecimal perFamilyLimit;

    private BigDecimal totalPremium;
    private BigDecimal premiumPerMember;

    @NotNull(message = "Number of lives is required")
    private Integer numberOfLives;

    @NotNull(message = "Number of families is required")
    private Integer numberOfFamilies;

    private String exclusions;
    private String specialConditions;
    private String notes;

    @Builder.Default
    private Boolean active = true;
}
