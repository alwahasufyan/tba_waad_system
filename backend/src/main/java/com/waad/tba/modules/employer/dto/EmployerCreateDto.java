package com.waad.tba.modules.employer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmployerCreateDto {

    @NotBlank
    private String name;

    private String nameEn;

    @NotBlank
    private String code;
}
