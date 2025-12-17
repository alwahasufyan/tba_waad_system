package com.waad.tba.modules.insurance.dto;

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
public class InsuranceCompanyCreateDto {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Code is required")
    private String code;
    
    private String address;
    private String phone;
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String contactPerson;
    
    @Builder.Default
    private Boolean active = true;
}
