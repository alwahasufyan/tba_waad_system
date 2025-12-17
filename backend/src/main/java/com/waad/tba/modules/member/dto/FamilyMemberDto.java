package com.waad.tba.modules.member.dto;

import java.time.LocalDate;

import com.waad.tba.modules.member.entity.FamilyMember;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "Family member data transfer object")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberDto {

    @Schema(description = "Family member ID", example = "1")
    private Long id;

    @Schema(description = "Relationship type", example = "SON", required = true)
    @NotNull(message = "Relationship is required")
    private FamilyMember.Relationship relationship;

    @Schema(description = "Full name in Arabic", example = "محمد أحمد علي", required = true)
    @NotBlank(message = "Full name in Arabic is required")
    private String fullNameArabic;

    @Schema(description = "Full name in English", example = "Mohammed Ahmed Ali")
    private String fullNameEnglish;

    @Schema(description = "Civil ID", example = "289123456789", required = true)
    @NotBlank(message = "Civil ID is required")
    private String civilId;

    @Schema(description = "Birth date", example = "2010-05-15", required = true)
    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @Schema(description = "Gender", example = "MALE", required = true)
    @NotNull(message = "Gender is required")
    private FamilyMember.Gender gender;

    @Schema(description = "Status", example = "ACTIVE")
    private FamilyMember.FamilyMemberStatus status;

    @Schema(description = "Card number", example = "FM-123456")
    private String cardNumber;

    @Schema(description = "Phone number", example = "+96512345678")
    private String phone;

    @Schema(description = "Notes", example = "Student, requires special care")
    private String notes;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
