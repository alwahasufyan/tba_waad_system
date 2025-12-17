package com.waad.tba.modules.provider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderContractViewDto {
    private Long id;
    private Long providerId;
    private String providerNameArabic;
    private String providerNameEnglish;
    private String contractNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean autoRenew;
    private BigDecimal discountRate;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
