package com.waad.tba.modules.preauth.dto;

import com.waad.tba.modules.preauth.entity.PreApproval;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreApprovalCheckResponseDto {
    
    private boolean required;
    private String reason;
    private boolean exceedLimit;
    private BigDecimal exceedAmount;
    private PreApproval.ApprovalLevel requiredLevel;
    private boolean allowAutoApproval;
    private boolean canAutoApprove;
    private boolean hasValidApproval;
    private String validApprovalNumber;
    private BigDecimal approvedAmount;
}
