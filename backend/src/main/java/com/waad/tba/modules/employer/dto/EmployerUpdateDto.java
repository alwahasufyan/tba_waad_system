package com.waad.tba.modules.employer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmployerUpdateDto {

    @NotBlank
    private String name;

    private String nameEn;

    @NotBlank
    private String code;
    
    private Boolean active;
}
