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
public class PreApprovalApproveDto {
    
    @NotNull(message = "Approved amount is required")
    private BigDecimal approvedAmount;
    
    private String notes;
    
    private Integer validityDays;
}
