package com.waad.tba.modules.preauth.dto;

import com.waad.tba.modules.preauth.entity.PreApproval;
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
public class PreApprovalResponseDto {
    
    private Long id;
    private String approvalNumber;
    private PreApproval.ApprovalType type;
    private Long memberId;
    private String memberName;
    private String memberCardNumber;
    private Long providerId;
    private String providerName;
    private String serviceCode;
    private String serviceDescription;
    private String diagnosisCode;
    private String diagnosisDescription;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private BigDecimal rejectedAmount;
    private BigDecimal memberRemainingBalance;
    private BigDecimal exceedAmount;
    private PreApproval.ApprovalStatus status;
    private PreApproval.ApprovalLevel requiredLevel;
    private LocalDate requestDate;
    private LocalDate expectedServiceDate;
    private String requestReason;
    private Long medicalReviewerId;
    private String medicalReviewerName;
    private LocalDateTime medicalReviewedAt;
    private String medicalReviewNotes;
    private Long managerApproverId;
    private String managerApproverName;
    private LocalDateTime managerApprovedAt;
    private String managerNotes;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private Boolean expired;
    private String rejectionReason;
    private Boolean autoApproved;
    private String autoApprovalRule;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
