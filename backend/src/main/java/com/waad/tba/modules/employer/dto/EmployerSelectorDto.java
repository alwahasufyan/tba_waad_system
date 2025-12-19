package com.waad.tba.modules.employer.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployerSelectorDto {

    private Long id;
    private String name;
}
