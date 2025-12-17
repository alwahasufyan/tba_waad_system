package com.waad.tba.modules.insurancepolicy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyBenefitPackageViewDto {

    private Long id;
    private String name;
    private String code;
    private BigDecimal maxLimit;
    private BigDecimal copayPercentage;
    private String coverageDescription;
    private Boolean active;
    
    // Parent Policy Info
    private Long insurancePolicyId;
    private String insurancePolicyName;
    private String insurancePolicyCode;
    
    // Audit Info
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
