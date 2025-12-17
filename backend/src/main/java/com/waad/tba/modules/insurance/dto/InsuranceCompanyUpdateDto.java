package com.waad.tba.modules.insurance.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceCompanyUpdateDto {
    
    private String name;
    private String code;
    private String address;
    private String phone;
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String contactPerson;
    private Boolean active;
}
