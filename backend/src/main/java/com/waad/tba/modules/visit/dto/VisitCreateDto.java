package com.waad.tba.modules.visit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitCreateDto {
    
    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    private Long providerId;
    
    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;
    
    @NotBlank(message = "Doctor name is required")
    private String doctorName;
    
    private String specialty;
    
    private String diagnosis;
    
    private String treatment;
    
    private BigDecimal totalAmount;
    
    private String notes;
}
