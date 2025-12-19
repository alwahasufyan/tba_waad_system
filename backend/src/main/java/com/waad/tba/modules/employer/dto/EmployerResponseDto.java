package com.waad.tba.modules.employer.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployerResponseDto {

    private Long id;
    private String name;
    private String nameEn;
    private String code;
    private boolean active;
}
