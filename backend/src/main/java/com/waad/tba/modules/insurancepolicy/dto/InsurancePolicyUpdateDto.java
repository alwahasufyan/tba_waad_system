package com.waad.tba.modules.insurancepolicy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePolicyUpdateDto {

    private String name;
    private String code;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long insuranceCompanyId;
    private Boolean active;
}
