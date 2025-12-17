package com.waad.tba.modules.employer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerCreateDto {
    
    @NotBlank(message = "Employer code is required")
    private String code;
    
    @NotBlank(message = "Employer name (Arabic) is required")
    private String nameAr;
    
    @NotBlank(message = "Employer name (English) is required")
    private String nameEn;
    
    private String phone;
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String address;
    
    private Boolean active;
}
