package com.waad.tba.modules.preauth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class PreAuthorizationDto {

    private Long id;

    private String preAuthNumber;

    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    private String memberName;
    private String memberCardNumber;

    @NotNull(message = "Provider ID is required")
    private Long providerId;
    
    private String providerName;

    @NotBlank(message = "Diagnosis code is required")
    private String diagnosisCode;
    
    private String diagnosisDescription;

    private String procedureCodes;
    private String procedureDescriptions;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private BigDecimal estimatedCost;
    private BigDecimal approvedAmount;

    private String doctorName;
    private String doctorSpecialty;

    @NotNull(message = "Request date is required")
    private LocalDate requestDate;

    @NotNull(message = "Expected service date is required")
    private LocalDate expectedServiceDate;

    private LocalDate serviceFromDate;
    private LocalDate serviceToDate;
    private Integer numberOfDays;

    private String status;

    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewedAt;

    private LocalDate approvalExpiryDate;

    private String requestNotes;
    private String reviewerNotes;
    private String rejectionReason;

    private String attachments;

    private Boolean active;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
