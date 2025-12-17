package com.waad.tba.modules.claim.dto;

import com.waad.tba.modules.claim.entity.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimViewDto {
    private Long id;
    
    // Member information
    private Long memberId;
    private String memberFullNameArabic;
    private String memberCivilId;
    
    // Insurance Company information
    private Long insuranceCompanyId;
    private String insuranceCompanyName;
    private String insuranceCompanyCode;
    
    // Insurance Policy information
    private Long insurancePolicyId;
    private String insurancePolicyName;
    private String insurancePolicyCode;
    
    // Benefit Package information
    private Long benefitPackageId;
    private String benefitPackageName;
    private String benefitPackageCode;
    
    // Pre-Approval information
    private Long preApprovalId;
    private String preApprovalStatus;
    
    // Claim details
    private String providerName;
    private String doctorName;
    private String diagnosis;
    private LocalDate visitDate;
    
    // Financial information
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private BigDecimal differenceAmount;
    
    // Status and review
    private ClaimStatus status;
    private String statusLabel;
    private String reviewerComment;
    private LocalDateTime reviewedAt;
    
    // Counts
    private Integer serviceCount;
    private Integer attachmentsCount;
    
    // Lines and attachments
    private List<ClaimLineDto> lines;
    private List<ClaimAttachmentDto> attachments;
    
    // Audit fields
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
