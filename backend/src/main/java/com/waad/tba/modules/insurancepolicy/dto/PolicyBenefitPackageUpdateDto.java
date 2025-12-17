package com.waad.tba.modules.insurancepolicy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyBenefitPackageUpdateDto {

    private String name;
    private String code;
    private BigDecimal maxLimit;
    private BigDecimal copayPercentage;
    private String coverageDescription;
    private Boolean active;
}
