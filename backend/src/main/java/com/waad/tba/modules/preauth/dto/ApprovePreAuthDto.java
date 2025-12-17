package com.waad.tba.modules.preauth.dto;

import jakarta.validation.constraints.NotBlank;
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
public class ApprovePreAuthDto {

    @NotNull(message = "Approved amount is required")
    private BigDecimal approvedAmount;

    private String reviewerNotes;

    private Integer validityDays;
}
