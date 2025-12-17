package com.waad.tba.modules.employer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerResponseDto {
    private Long id;
    private String code;
    private String nameAr;
    private String nameEn;
    private String phone;
    private String email;
    private Boolean active;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
