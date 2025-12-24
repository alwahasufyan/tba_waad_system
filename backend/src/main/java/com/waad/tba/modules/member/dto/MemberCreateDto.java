package com.waad.tba.modules.member.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import com.waad.tba.modules.member.entity.Member;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO for creating a new member")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberCreateDto {
    
    // Personal Information
    @Schema(description = "Full name in Arabic", example = "أحمد محمد علي", required = true)
    @NotBlank(message = "Full name in Arabic is required")
    private String fullNameArabic;

    @Schema(description = "Full name in English", example = "Ahmed Mohammed Ali")
    private String fullNameEnglish;

    @Schema(description = "Civil ID", example = "289123456789", required = true)
    @NotBlank(message = "Civil ID is required")
    private String civilId;

    @Schema(description = "Card number", example = "MEM-123456")
    private String cardNumber;

    @Schema(description = "Birth date", example = "1990-01-15", required = true)
    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @Schema(description = "Gender", example = "MALE", required = true)
    @NotNull(message = "Gender is required")
    private Member.Gender gender;

    @Schema(description = "Marital status", example = "MARRIED")
    private Member.MaritalStatus maritalStatus;

    @Schema(description = "Phone number", example = "+96512345678")
    private String phone;

    @Schema(description = "Email address", example = "ahmed@example.com")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "Address", example = "Block 5, Street 10, House 25, Kuwait")
    private String address;

    @Schema(description = "Nationality", example = "Kuwaiti")
    private String nationality;

    // Insurance Information
    @Schema(description = "Policy number", example = "POL-2024-001")
    private String policyNumber;

    @Schema(description = "Benefit package ID", example = "1")
    private Long benefitPackageId;

    @Schema(description = "Insurance company ID", example = "1")
    private Long insuranceCompanyId;

    // Employment Information
    @Schema(description = "Employer ID", example = "1", required = true)
    @NotNull(message = "Employer is required")
    private Long employerId;

    @Schema(description = "Employee number", example = "EMP-001")
    private String employeeNumber;

    @Schema(description = "Join date", example = "2024-01-01")
    private LocalDate joinDate;

    @Schema(description = "Occupation", example = "Software Engineer")
    private String occupation;

    // Membership Status
    @Schema(description = "Member status", example = "ACTIVE")
    private Member.MemberStatus status;

    @Schema(description = "Start date", example = "2024-01-01")
    private LocalDate startDate;

    @Schema(description = "End date", example = "2025-01-01")
    private LocalDate endDate;

    @Schema(description = "Card status", example = "ACTIVE")
    private Member.CardStatus cardStatus;

    @Schema(description = "Notes", example = "VIP member")
    private String notes;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;

    // Family Members
    @Schema(description = "List of family members")
    @Valid
    private List<FamilyMemberDto> familyMembers;

    // Flexible Attributes
    @Schema(description = "List of custom attributes (key-value pairs)")
    @Valid
    private List<MemberAttributeDto> attributes;
}
