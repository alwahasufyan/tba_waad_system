package com.waad.tba.modules.provider.dto;

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
public class ProviderContractCreateDto {
    private Long providerId;
    private String contractNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean autoRenew;
    private BigDecimal discountRate;
    private String notes;
}
