package com.waad.tba.modules.member.mapper;

import org.springframework.stereotype.Component;

import com.waad.tba.modules.member.dto.MemberResponseDto;
import com.waad.tba.modules.member.entity.Member;

@Component
public class MemberMapper {

    public MemberResponseDto toResponseDto(Member entity) {
        if (entity == null) return null;

        return MemberResponseDto.builder()
                .id(entity.getId())
                .employerId(entity.getEmployer() != null ? entity.getEmployer().getId() : null)
                .employerName(entity.getEmployer() != null ? entity.getEmployer().getNameAr() : null)
                .fullName(entity.getFullName()) // يستخدم getFullName() من الـ Entity
                .civilId(entity.getCivilId())
                .policyNumber(entity.getPolicyNumber())
                .dateOfBirth(entity.getBirthDate()) // ملاحظة: DTO يستخدم dateOfBirth لكن Entity يستخدم birthDate
                .gender(entity.getGender() != null ? entity.getGender().name() : null)
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
