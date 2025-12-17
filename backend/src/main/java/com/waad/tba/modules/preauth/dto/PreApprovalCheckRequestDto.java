package com.waad.tba.modules.preauth.dto;

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
public class PreApprovalCheckRequestDto {
    
    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    @NotNull(message = "Service code is required")
    private String serviceCode;
    
    @NotNull(message = "Provider ID is required")
    private Long providerId;
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
}
