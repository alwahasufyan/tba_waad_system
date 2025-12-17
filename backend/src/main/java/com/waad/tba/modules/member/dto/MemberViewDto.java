package com.waad.tba.modules.member.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.waad.tba.modules.member.entity.Member;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO for viewing member details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberViewDto {

    @Schema(description = "Member ID", example = "1")
    private Long id;

    // Personal Information
    @Schema(description = "Full name in Arabic", example = "أحمد محمد علي")
    private String fullNameArabic;

    @Schema(description = "Full name in English", example = "Ahmed Mohammed Ali")
    private String fullNameEnglish;

    @Schema(description = "Civil ID", example = "289123456789")
    private String civilId;

    @Schema(description = "Card number", example = "MEM-123456")
    private String cardNumber;

    @Schema(description = "Birth date", example = "1990-01-15")
    private LocalDate birthDate;

    @Schema(description = "Gender", example = "MALE")
    private Member.Gender gender;

    @Schema(description = "Marital status", example = "MARRIED")
    private Member.MaritalStatus maritalStatus;

    @Schema(description = "Phone number", example = "+96512345678")
    private String phone;

    @Schema(description = "Email address", example = "ahmed@example.com")
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

    @Schema(description = "Insurance company name", example = "Kuwait Insurance Company")
    private String insuranceCompanyName;

    // Employment Information
    @Schema(description = "Employer ID", example = "1")
    private Long employerId;

    @Schema(description = "Employer name", example = "ABC Company")
    private String employerName;

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

    @Schema(description = "Blocked reason", example = "Exceeded limit")
    private String blockedReason;

    // Additional
    @Schema(description = "QR code value", example = "QR-123456")
    private String qrCodeValue;

    @Schema(description = "Eligibility status", example = "true")
    private Boolean eligibilityStatus;

    @Schema(description = "Photo URL", example = "https://example.com/photo.jpg")
    private String photoUrl;

    @Schema(description = "Notes", example = "VIP member")
    private String notes;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;

    // Audit
    @Schema(description = "Created by", example = "admin")
    private String createdBy;

    @Schema(description = "Updated by", example = "admin")
    private String updatedBy;

    @Schema(description = "Created at", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;

    // Family Members
    @Schema(description = "List of family members")
    private List<FamilyMemberDto> familyMembers;

    @Schema(description = "Family members count", example = "3")
    private Integer familyMembersCount;
}
