package com.waad.tba.modules.claim.dto;

import com.waad.tba.modules.claim.entity.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimUpdateDto {
    private String providerName;
    private String doctorName;
    private String diagnosis;
    private LocalDate visitDate;
    private BigDecimal requestedAmount;
    
    private ClaimStatus status;
    private BigDecimal approvedAmount;
    private String reviewerComment;
    
    private Long insurancePolicyId;
    private Long benefitPackageId;
    private Long preApprovalId;
    
    private List<ClaimLineDto> lines;
    private List<ClaimAttachmentDto> attachments;
    
    private Boolean active;
}
