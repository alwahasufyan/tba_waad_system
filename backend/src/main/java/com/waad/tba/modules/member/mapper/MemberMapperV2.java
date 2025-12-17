package com.waad.tba.modules.member.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import com.waad.tba.modules.member.dto.FamilyMemberDto;
import com.waad.tba.modules.member.dto.MemberCreateDto;
import com.waad.tba.modules.member.dto.MemberSelectorDto;
import com.waad.tba.modules.member.dto.MemberUpdateDto;
import com.waad.tba.modules.member.dto.MemberViewDto;
import com.waad.tba.modules.member.entity.FamilyMember;
import com.waad.tba.modules.member.entity.Member;

@Component
public class MemberMapperV2 {

    public Member toEntity(MemberCreateDto dto) {
        if (dto == null) return null;

        Member entity = Member.builder()
                .fullNameArabic(dto.getFullNameArabic())
                .fullNameEnglish(dto.getFullNameEnglish())
                .civilId(dto.getCivilId())
                .cardNumber(dto.getCardNumber())
                .birthDate(dto.getBirthDate())
                .gender(dto.getGender())
                .maritalStatus(dto.getMaritalStatus())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .nationality(dto.getNationality())
                .policyNumber(dto.getPolicyNumber())
                .benefitPackageId(dto.getBenefitPackageId())
                .employeeNumber(dto.getEmployeeNumber())
                .joinDate(dto.getJoinDate())
                .occupation(dto.getOccupation())
                .status(dto.getStatus() != null ? dto.getStatus() : Member.MemberStatus.ACTIVE)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .cardStatus(dto.getCardStatus() != null ? dto.getCardStatus() : Member.CardStatus.ACTIVE)
                .notes(dto.getNotes())
                .active(dto.getActive() != null && dto.getActive())
                .build();

        if (dto.getEmployerId() != null) {
            Employer employer = new Employer();
            employer.setId(dto.getEmployerId());
            entity.setEmployer(employer);
        }

        if (dto.getInsuranceCompanyId() != null) {
            InsuranceCompany ic = new InsuranceCompany();
            ic.setId(dto.getInsuranceCompanyId());
            entity.setInsuranceCompany(ic);
        }

        return entity;
    }

    public void updateEntityFromDto(Member entity, MemberUpdateDto dto) {
        if (entity == null || dto == null) return;

        if (dto.getFullNameArabic() != null) entity.setFullNameArabic(dto.getFullNameArabic());
        if (dto.getFullNameEnglish() != null) entity.setFullNameEnglish(dto.getFullNameEnglish());
        if (dto.getCardNumber() != null) entity.setCardNumber(dto.getCardNumber());
        if (dto.getBirthDate() != null) entity.setBirthDate(dto.getBirthDate());
        if (dto.getGender() != null) entity.setGender(dto.getGender());
        if (dto.getMaritalStatus() != null) entity.setMaritalStatus(dto.getMaritalStatus());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getNationality() != null) entity.setNationality(dto.getNationality());
        if (dto.getPolicyNumber() != null) entity.setPolicyNumber(dto.getPolicyNumber());
        if (dto.getBenefitPackageId() != null) entity.setBenefitPackageId(dto.getBenefitPackageId());
        if (dto.getEmployeeNumber() != null) entity.setEmployeeNumber(dto.getEmployeeNumber());
        if (dto.getJoinDate() != null) entity.setJoinDate(dto.getJoinDate());
        if (dto.getOccupation() != null) entity.setOccupation(dto.getOccupation());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
        if (dto.getCardStatus() != null) entity.setCardStatus(dto.getCardStatus());
        if (dto.getNotes() != null) entity.setNotes(dto.getNotes());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
    }

    public MemberViewDto toViewDto(Member entity, List<FamilyMember> familyMembers) {
        if (entity == null) return null;

        MemberViewDto dto = MemberViewDto.builder()
                .id(entity.getId())
                .fullNameArabic(entity.getFullNameArabic())
                .fullNameEnglish(entity.getFullNameEnglish())
                .civilId(entity.getCivilId())
                .cardNumber(entity.getCardNumber())
                .birthDate(entity.getBirthDate())
                .gender(entity.getGender())
                .maritalStatus(entity.getMaritalStatus())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .nationality(entity.getNationality())
                .policyNumber(entity.getPolicyNumber())
                .benefitPackageId(entity.getBenefitPackageId())
                .employeeNumber(entity.getEmployeeNumber())
                .joinDate(entity.getJoinDate())
                .occupation(entity.getOccupation())
                .status(entity.getStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .cardStatus(entity.getCardStatus())
                .blockedReason(entity.getBlockedReason())
                .qrCodeValue(entity.getQrCodeValue())
                .eligibilityStatus(entity.getEligibilityStatus())
                .photoUrl(entity.getPhotoUrl())
                .notes(entity.getNotes())
                .active(entity.getActive())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        if (entity.getEmployer() != null) {
            dto.setEmployerId(entity.getEmployer().getId());
            dto.setEmployerName(entity.getEmployer().getNameAr());
        }

        if (entity.getInsuranceCompany() != null) {
            dto.setInsuranceCompanyId(entity.getInsuranceCompany().getId());
            dto.setInsuranceCompanyName(entity.getInsuranceCompany().getName());
        }

        if (familyMembers != null && !familyMembers.isEmpty()) {
            dto.setFamilyMembers(familyMembers.stream()
                    .map(this::toFamilyMemberDto)
                    .collect(Collectors.toList()));

            dto.setFamilyMembersCount(familyMembers.size());
        } else {
            dto.setFamilyMembersCount(0);
        }

        return dto;
    }

    public MemberSelectorDto toSelectorDto(Member entity) {
        if (entity == null) return null;
        
        return MemberSelectorDto.builder()
                .id(entity.getId())
                .cardNumber(entity.getCardNumber())
                .fullNameAr(entity.getFullNameArabic())
                .fullName(entity.getFullNameArabic())
                .build();
    }

    public FamilyMemberDto toFamilyMemberDto(FamilyMember fm) {
        if (fm == null) return null;

        return FamilyMemberDto.builder()
                .id(fm.getId())
                .relationship(fm.getRelationship())
                .fullNameArabic(fm.getFullNameArabic())
                .fullNameEnglish(fm.getFullNameEnglish())
                .civilId(fm.getCivilId())
                .birthDate(fm.getBirthDate())
                .gender(fm.getGender())
                .status(fm.getStatus())
                .cardNumber(fm.getCardNumber())
                .phone(fm.getPhone())
                .notes(fm.getNotes())
                .active(fm.getActive())
                .build();
    }

    public FamilyMember toFamilyMemberEntity(FamilyMemberDto dto) {
        if (dto == null) return null;

        return FamilyMember.builder()
                .id(dto.getId())
                .relationship(dto.getRelationship())
                .fullNameArabic(dto.getFullNameArabic())
                .fullNameEnglish(dto.getFullNameEnglish())
                .civilId(dto.getCivilId())
                .birthDate(dto.getBirthDate())
                .gender(dto.getGender())
                .status(dto.getStatus() != null ? dto.getStatus() : FamilyMember.FamilyMemberStatus.ACTIVE)
                .cardNumber(dto.getCardNumber())
                .phone(dto.getPhone())
                .notes(dto.getNotes())
                .active(dto.getActive() != null && dto.getActive())
                .build();
    }
}
