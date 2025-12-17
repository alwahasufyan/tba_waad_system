package com.waad.tba.modules.visit.mapper;

import org.springframework.stereotype.Component;

import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.visit.dto.VisitCreateDto;
import com.waad.tba.modules.visit.dto.VisitResponseDto;
import com.waad.tba.modules.visit.entity.Visit;

@Component
public class VisitMapper {

    public VisitResponseDto toResponseDto(Visit entity) {
        if (entity == null) return null;
        
        String memberName = null;
        String memberNumber = null;
        if (entity.getMember() != null) {
            memberName = entity.getMember().getFullName();
            memberNumber = entity.getMember().getCardNumber();
        }
        
        return VisitResponseDto.builder()
                .id(entity.getId())
                .memberId(entity.getMember() != null ? entity.getMember().getId() : null)
                .memberName(memberName)
                .memberNumber(memberNumber)
                .providerId(entity.getProviderId())
                .visitDate(entity.getVisitDate())
                .doctorName(entity.getDoctorName())
                .specialty(entity.getSpecialty())
                .diagnosis(entity.getDiagnosis())
                .treatment(entity.getTreatment())
                .totalAmount(entity.getTotalAmount())
                .notes(entity.getNotes())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Visit toEntity(VisitCreateDto dto, Member member) {
        if (dto == null) return null;
        
        return Visit.builder()
                .member(member)
                .providerId(dto.getProviderId())
                .visitDate(dto.getVisitDate())
                .doctorName(dto.getDoctorName())
                .specialty(dto.getSpecialty())
                .diagnosis(dto.getDiagnosis())
                .treatment(dto.getTreatment())
                .totalAmount(dto.getTotalAmount())
                .notes(dto.getNotes())
                .active(true)
                .build();
    }

    public void updateEntityFromDto(Visit entity, VisitCreateDto dto, Member member) {
        if (dto == null) return;
        
        entity.setMember(member);
        entity.setProviderId(dto.getProviderId());
        entity.setVisitDate(dto.getVisitDate());
        entity.setDoctorName(dto.getDoctorName());
        entity.setSpecialty(dto.getSpecialty());
        entity.setDiagnosis(dto.getDiagnosis());
        entity.setTreatment(dto.getTreatment());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setNotes(dto.getNotes());
    }
}
