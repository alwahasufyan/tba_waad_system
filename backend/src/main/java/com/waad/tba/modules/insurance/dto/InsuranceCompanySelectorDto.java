package com.waad.tba.modules.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceCompanySelectorDto {
    private Long id;
    private String code;
    private String nameAr;
    private String nameEn;
}
