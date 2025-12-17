package com.waad.tba.modules.policy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenefitPackageDto {

    private Long id;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Name (Arabic) is required")
    private String nameAr;

    @NotBlank(message = "Name (English) is required")
    private String nameEn;

    private String description;

    private BigDecimal opCoverageLimit;
    private BigDecimal opCoPaymentPercentage;

    private BigDecimal ipCoverageLimit;
    private BigDecimal ipCoPaymentPercentage;

    @Builder.Default
    private Boolean maternityCovered = false;
    private BigDecimal maternityCoverageLimit;

    @Builder.Default
    private Boolean dentalCovered = false;
    private BigDecimal dentalCoverageLimit;

    @Builder.Default
    private Boolean opticalCovered = false;
    private BigDecimal opticalCoverageLimit;

    @Builder.Default
    private Boolean pharmacyCovered = true;
    private BigDecimal pharmacyCoverageLimit;

    private BigDecimal annualLimitPerMember;
    private BigDecimal lifetimeLimitPerMember;

    @Builder.Default
    private Boolean emergencyCovered = true;

    @Builder.Default
    private Boolean chronicDiseaseCovered = false;

    @Builder.Default
    private Boolean preExistingConditionsCovered = false;

    private String limitRulesJson;

    @NotNull
    @Builder.Default
    private Boolean active = true;
}
