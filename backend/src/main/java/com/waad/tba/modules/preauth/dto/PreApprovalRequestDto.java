package com.waad.tba.modules.preauth.dto;

import com.waad.tba.modules.preauth.entity.PreApproval;
import jakarta.validation.constraints.NotNull;
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
public class PreApprovalRequestDto {
    
    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    @NotNull(message = "Provider ID is required")
    private Long providerId;
    
    @NotNull(message = "Service code is required")
    private String serviceCode;
    
    private String serviceDescription;
    
    private String diagnosisCode;
    
    private String diagnosisDescription;
    
    @NotNull(message = "Requested amount is required")
    private BigDecimal requestedAmount;
    
    private LocalDate expectedServiceDate;
    
    private String requestReason;
    
    @NotNull(message = "Approval type is required")
    private PreApproval.ApprovalType type;
    
    private String notes;
}
