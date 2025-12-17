package com.waad.tba.modules.insurancepolicy.dto;

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
public class PolicyBenefitPackageCreateDto {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Code is required")
    private String code;

    private BigDecimal maxLimit;
    private BigDecimal copayPercentage;
    private String coverageDescription;

    @Builder.Default
    private Boolean active = true;
}
