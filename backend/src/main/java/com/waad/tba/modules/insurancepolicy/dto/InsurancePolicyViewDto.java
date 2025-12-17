package com.waad.tba.modules.insurancepolicy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePolicyViewDto {

    private Long id;
    private String name;
    private String code;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
    
    // Insurance Company Info
    private Long insuranceCompanyId;
    private String insuranceCompanyName;
    private String insuranceCompanyCode;
    
    // Audit Info
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
