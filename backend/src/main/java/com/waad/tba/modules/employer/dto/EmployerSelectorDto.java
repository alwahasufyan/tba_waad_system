package com.waad.tba.modules.employer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Employer Selector (used in multi-employer filter)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployerSelectorDto {
    private Long id;
    private String name;
    private String code;
}
