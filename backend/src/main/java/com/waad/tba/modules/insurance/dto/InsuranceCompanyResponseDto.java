package com.waad.tba.modules.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceCompanyResponseDto {
    private Long id;
    private String name;
    private String code;
    private String address;
    private String phone;
    private String email;
    private String contactPerson;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
