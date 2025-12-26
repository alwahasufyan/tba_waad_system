package com.waad.tba.modules.claim.mapper;

import com.waad.tba.modules.claim.dto.*;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.entity.ClaimAttachment;
import com.waad.tba.modules.claim.entity.ClaimLine;
import com.waad.tba.common.repository.OrganizationRepository;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.preauth.repository.PreApprovalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ClaimMapper {

    private final MemberRepository memberRepository;
    private final OrganizationRepository organizationRepository;
    private final PreApprovalRepository preApprovalRepository;

    public Claim toEntity(ClaimCreateDto dto) {
        Claim claim = Claim.builder()
                .member(memberRepository.findById(dto.getMemberId())
                        .orElseThrow(() -> new IllegalArgumentException("Member not found")))
                .insuranceOrganization(dto.getInsuranceCompanyId() != null 
                        ? organizationRepository.findById(dto.getInsuranceCompanyId())
                                .orElseThrow(() -> new IllegalArgumentException("Insurance organization not found"))
                        : null)
                .providerName(dto.getProviderName())
                .doctorName(dto.getDoctorName())
                .diagnosis(dto.getDiagnosis())
                .visitDate(dto.getVisitDate())
                .requestedAmount(dto.getRequestedAmount())
                .build();

        // REMOVED: InsurancePolicy and PolicyBenefitPackage mapping
        // Coverage is determined via Member.benefitPolicy
        
        if (dto.getPreApprovalId() != null) {
            claim.setPreApproval(preApprovalRepository.findById(dto.getPreApprovalId()).orElse(null));
        }

        if (dto.getLines() != null && !dto.getLines().isEmpty()) {
            List<ClaimLine> lines = dto.getLines().stream()
                    .map(lineDto -> ClaimLine.builder()
                            .claim(claim)
                            .serviceCode(lineDto.getServiceCode())
                            .description(lineDto.getDescription())
                            .quantity(lineDto.getQuantity())
                            .unitPrice(lineDto.getUnitPrice())
                            .build())
                    .collect(Collectors.toList());
            claim.setLines(lines);
        }

        if (dto.getAttachments() != null && !dto.getAttachments().isEmpty()) {
            List<ClaimAttachment> attachments = dto.getAttachments().stream()
                    .map(attDto -> ClaimAttachment.builder()
                            .claim(claim)
                            .fileName(attDto.getFileName())
                            .fileUrl(attDto.getFileUrl())
                            .fileType(attDto.getFileType())
                            .build())
                    .collect(Collectors.toList());
            claim.setAttachments(attachments);
        }

        return claim;
    }

    public void updateEntityFromDto(Claim claim, ClaimUpdateDto dto) {
        if (dto.getProviderName() != null) claim.setProviderName(dto.getProviderName());
        if (dto.getDoctorName() != null) claim.setDoctorName(dto.getDoctorName());
        if (dto.getDiagnosis() != null) claim.setDiagnosis(dto.getDiagnosis());
        if (dto.getVisitDate() != null) claim.setVisitDate(dto.getVisitDate());
        if (dto.getRequestedAmount() != null) claim.setRequestedAmount(dto.getRequestedAmount());
        if (dto.getStatus() != null) claim.setStatus(dto.getStatus());
        if (dto.getApprovedAmount() != null) claim.setApprovedAmount(dto.getApprovedAmount());
        if (dto.getReviewerComment() != null) claim.setReviewerComment(dto.getReviewerComment());
        if (dto.getActive() != null) claim.setActive(dto.getActive());

        // REMOVED: InsurancePolicy and PolicyBenefitPackage mapping
        
        if (dto.getPreApprovalId() != null) {
            claim.setPreApproval(preApprovalRepository.findById(dto.getPreApprovalId()).orElse(null));
        }

        if (dto.getLines() != null) {
            claim.getLines().clear();
            dto.getLines().forEach(lineDto -> {
                ClaimLine line = ClaimLine.builder()
                        .claim(claim)
                        .serviceCode(lineDto.getServiceCode())
                        .description(lineDto.getDescription())
                        .quantity(lineDto.getQuantity())
                        .unitPrice(lineDto.getUnitPrice())
                        .build();
                claim.addLine(line);
            });
        }

        if (dto.getAttachments() != null) {
            claim.getAttachments().clear();
            dto.getAttachments().forEach(attDto -> {
                ClaimAttachment attachment = ClaimAttachment.builder()
                        .claim(claim)
                        .fileName(attDto.getFileName())
                        .fileUrl(attDto.getFileUrl())
                        .fileType(attDto.getFileType())
                        .build();
                claim.addAttachment(attachment);
            });
        }
    }

    public ClaimViewDto toViewDto(Claim claim) {
        ClaimViewDto dto = ClaimViewDto.builder()
                .id(claim.getId())
                .providerName(claim.getProviderName())
                .doctorName(claim.getDoctorName())
                .diagnosis(claim.getDiagnosis())
                .visitDate(claim.getVisitDate())
                .requestedAmount(claim.getRequestedAmount())
                .approvedAmount(claim.getApprovedAmount())
                .differenceAmount(claim.getDifferenceAmount())
                .status(claim.getStatus())
                .statusLabel(claim.getStatus() != null ? claim.getStatus().getArabicLabel() : null)
                .reviewerComment(claim.getReviewerComment())
                .reviewedAt(claim.getReviewedAt())
                .serviceCount(claim.getServiceCount())
                .attachmentsCount(claim.getAttachmentsCount())
                .active(claim.getActive())
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .createdBy(claim.getCreatedBy())
                .updatedBy(claim.getUpdatedBy())
                // Financial Snapshot (MVP Phase)
                .patientCoPay(claim.getPatientCoPay())
                .netProviderAmount(claim.getNetProviderAmount())
                .coPayPercent(claim.getCoPayPercent())
                .deductibleApplied(claim.getDeductibleApplied())
                // Settlement Fields (MVP Phase)
                .paymentReference(claim.getPaymentReference())
                .settledAt(claim.getSettledAt())
                .settlementNotes(claim.getSettlementNotes())
                .build();

        if (claim.getMember() != null) {
            dto.setMemberId(claim.getMember().getId());
            dto.setMemberFullNameArabic(claim.getMember().getFullNameArabic());
            dto.setMemberCivilId(claim.getMember().getCivilId());
            
            // Get benefit policy info from member instead of claim
            if (claim.getMember().getBenefitPolicy() != null) {
                dto.setBenefitPackageId(claim.getMember().getBenefitPolicy().getId());
                dto.setBenefitPackageName(claim.getMember().getBenefitPolicy().getName());
                dto.setBenefitPackageCode(claim.getMember().getBenefitPolicy().getPolicyCode());
            }
        }

        if (claim.getInsuranceOrganization() != null) {
            dto.setInsuranceCompanyId(claim.getInsuranceOrganization().getId());
            dto.setInsuranceCompanyName(claim.getInsuranceOrganization().getName());
            dto.setInsuranceCompanyCode(claim.getInsuranceOrganization().getCode());
        }

        // REMOVED: InsurancePolicy mapping - coverage via Member.benefitPolicy

        if (claim.getPreApproval() != null) {
            dto.setPreApprovalId(claim.getPreApproval().getId());
            dto.setPreApprovalStatus(claim.getPreApproval().getStatus() != null ? claim.getPreApproval().getStatus().name() : null);
        }

        dto.setLines(claim.getLines() != null && !claim.getLines().isEmpty() 
                ? claim.getLines().stream().map(this::toLineDto).collect(Collectors.toList()) 
                : new ArrayList<>());

        dto.setAttachments(claim.getAttachments() != null && !claim.getAttachments().isEmpty() 
                ? claim.getAttachments().stream().map(this::toAttachmentDto).collect(Collectors.toList()) 
                : new ArrayList<>());

        return dto;
    }

    private ClaimLineDto toLineDto(ClaimLine line) {
        return ClaimLineDto.builder()
                .id(line.getId())
                .serviceCode(line.getServiceCode())
                .description(line.getDescription())
                .quantity(line.getQuantity())
                .unitPrice(line.getUnitPrice())
                .totalPrice(line.getTotalPrice())
                .build();
    }

    private ClaimAttachmentDto toAttachmentDto(ClaimAttachment attachment) {
        return ClaimAttachmentDto.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFileUrl())
                .fileType(attachment.getFileType())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
