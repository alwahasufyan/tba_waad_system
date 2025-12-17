package com.waad.tba.modules.company.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Company
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {

    private Long id;

    @NotBlank(message = "Company name is required")
    private String name;

    @NotBlank(message = "Company code is required")
    private String code;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
