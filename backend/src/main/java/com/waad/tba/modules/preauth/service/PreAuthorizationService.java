package com.waad.tba.modules.preauth.service;

import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.preauth.dto.ApprovePreAuthDto;
import com.waad.tba.modules.preauth.dto.PreAuthorizationDto;
import com.waad.tba.modules.preauth.dto.RejectPreAuthDto;
import com.waad.tba.modules.preauth.entity.PreAuthorization;
import com.waad.tba.modules.preauth.repository.PreAuthorizationRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.rbac.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreAuthorizationService {

    private final PreAuthorizationRepository preAuthRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PreAuthorizationDto> getAllPreAuthorizations() {
        log.info("Fetching all pre-authorizations");
        return preAuthRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PreAuthorizationDto getPreAuthorizationById(Long id) {
        log.info("Fetching pre-authorization by ID: {}", id);
        PreAuthorization preAuth = preAuthRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-authorization not found with ID: " + id));
        return toDto(preAuth);
    }

    @Transactional(readOnly = true)
    public PreAuthorizationDto getPreAuthorizationByNumber(String preAuthNumber) {
        log.info("Fetching pre-authorization by number: {}", preAuthNumber);
        PreAuthorization preAuth = preAuthRepository.findByPreAuthNumber(preAuthNumber)
                .orElseThrow(() -> new RuntimeException("Pre-authorization not found with number: " + preAuthNumber));
        return toDto(preAuth);
    }

    @Transactional(readOnly = true)
    public List<PreAuthorizationDto> getPreAuthorizationsByMember(Long memberId) {
        log.info("Fetching pre-authorizations for member ID: {}", memberId);
        return preAuthRepository.findByMemberId(memberId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreAuthorizationDto> getPreAuthorizationsByProvider(Long providerId) {
        log.info("Fetching pre-authorizations for provider ID: {}", providerId);
        return preAuthRepository.findByProviderId(providerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreAuthorizationDto> getPreAuthorizationsByStatus(String status) {
        log.info("Fetching pre-authorizations with status: {}", status);
        return preAuthRepository.findByStatus(PreAuthorization.PreAuthStatus.valueOf(status)).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PreAuthorizationDto createPreAuthorization(PreAuthorizationDto dto) {
        log.info("Creating new pre-authorization for member ID: {}", dto.getMemberId());

        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found with ID: " + dto.getMemberId()));

        String preAuthNumber = generatePreAuthNumber();
        
        PreAuthorization preAuth = PreAuthorization.builder()
                .preAuthNumber(preAuthNumber)
                .member(member)
                .providerId(dto.getProviderId())
                .providerName(dto.getProviderName())
                .diagnosisCode(dto.getDiagnosisCode())
                .diagnosisDescription(dto.getDiagnosisDescription())
                .procedureCodes(dto.getProcedureCodes())
                .procedureDescriptions(dto.getProcedureDescriptions())
                .serviceType(PreAuthorization.ServiceType.valueOf(dto.getServiceType()))
                .estimatedCost(dto.getEstimatedCost())
                .doctorName(dto.getDoctorName())
                .doctorSpecialty(dto.getDoctorSpecialty())
                .requestDate(dto.getRequestDate())
                .expectedServiceDate(dto.getExpectedServiceDate())
                .serviceFromDate(dto.getServiceFromDate())
                .serviceToDate(dto.getServiceToDate())
                .numberOfDays(dto.getNumberOfDays())
                .status(PreAuthorization.PreAuthStatus.PENDING)
                .requestNotes(dto.getRequestNotes())
                .attachments(dto.getAttachments())
                .active(true)
                .build();

        PreAuthorization saved = preAuthRepository.save(preAuth);
        log.info("Pre-authorization created successfully with number: {}", saved.getPreAuthNumber());
        return toDto(saved);
    }

    @Transactional
    public PreAuthorizationDto updatePreAuthorization(Long id, PreAuthorizationDto dto) {
        log.info("Updating pre-authorization with ID: {}", id);

        PreAuthorization existing = preAuthRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-authorization not found with ID: " + id));

        if (existing.getStatus() != PreAuthorization.PreAuthStatus.PENDING) {
            throw new RuntimeException("Cannot update pre-authorization that is already reviewed");
        }

        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found with ID: " + dto.getMemberId()));

        existing.setMember(member);
        existing.setProviderId(dto.getProviderId());
        existing.setProviderName(dto.getProviderName());
        existing.setDiagnosisCode(dto.getDiagnosisCode());
        existing.setDiagnosisDescription(dto.getDiagnosisDescription());
        existing.setProcedureCodes(dto.getProcedureCodes());
        existing.setProcedureDescriptions(dto.getProcedureDescriptions());
        existing.setServiceType(PreAuthorization.ServiceType.valueOf(dto.getServiceType()));
        existing.setEstimatedCost(dto.getEstimatedCost());
        existing.setDoctorName(dto.getDoctorName());
        existing.setDoctorSpecialty(dto.getDoctorSpecialty());
        existing.setRequestDate(dto.getRequestDate());
        existing.setExpectedServiceDate(dto.getExpectedServiceDate());
        existing.setServiceFromDate(dto.getServiceFromDate());
        existing.setServiceToDate(dto.getServiceToDate());
        existing.setNumberOfDays(dto.getNumberOfDays());
        existing.setRequestNotes(dto.getRequestNotes());
        existing.setAttachments(dto.getAttachments());

        PreAuthorization updated = preAuthRepository.save(existing);
        log.info("Pre-authorization updated successfully");
        return toDto(updated);
    }

    @Transactional
    public PreAuthorizationDto approvePreAuthorization(Long id, ApprovePreAuthDto dto, Long reviewerId) {
        log.info("Approving pre-authorization ID: {} by reviewer: {}", id, reviewerId);

        PreAuthorization preAuth = preAuthRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-authorization not found with ID: " + id));

        if (preAuth.getStatus() != PreAuthorization.PreAuthStatus.PENDING && 
            preAuth.getStatus() != PreAuthorization.PreAuthStatus.UNDER_REVIEW) {
            throw new RuntimeException("Pre-authorization cannot be approved in current status");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with ID: " + reviewerId));

        preAuth.setStatus(PreAuthorization.PreAuthStatus.APPROVED);
        preAuth.setApprovedAmount(dto.getApprovedAmount());
        preAuth.setReviewer(reviewer);
        preAuth.setReviewedAt(LocalDateTime.now());
        preAuth.setReviewerNotes(dto.getReviewerNotes());
        
        int validityDays = dto.getValidityDays() != null ? dto.getValidityDays() : 30;
        preAuth.setApprovalExpiryDate(LocalDate.now().plusDays(validityDays));

        PreAuthorization updated = preAuthRepository.save(preAuth);
        log.info("Pre-authorization approved successfully");
        return toDto(updated);
    }

    @Transactional
    public PreAuthorizationDto rejectPreAuthorization(Long id, RejectPreAuthDto dto, Long reviewerId) {
        log.info("Rejecting pre-authorization ID: {} by reviewer: {}", id, reviewerId);

        PreAuthorization preAuth = preAuthRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-authorization not found with ID: " + id));

        if (preAuth.getStatus() != PreAuthorization.PreAuthStatus.PENDING && 
            preAuth.getStatus() != PreAuthorization.PreAuthStatus.UNDER_REVIEW) {
            throw new RuntimeException("Pre-authorization cannot be rejected in current status");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with ID: " + reviewerId));

        preAuth.setStatus(PreAuthorization.PreAuthStatus.REJECTED);
        preAuth.setRejectionReason(dto.getRejectionReason());
        preAuth.setReviewer(reviewer);
        preAuth.setReviewedAt(LocalDateTime.now());
        preAuth.setReviewerNotes(dto.getReviewerNotes());

        PreAuthorization updated = preAuthRepository.save(preAuth);
        log.info("Pre-authorization rejected successfully");
        return toDto(updated);
    }

    @Transactional
    public PreAuthorizationDto markUnderReview(Long id, Long reviewerId) {
        log.info("Marking pre-authorization ID: {} as under review by: {}", id, reviewerId);

        PreAuthorization preAuth = preAuthRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pre-authorization not found with ID: " + id));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with ID: " + reviewerId));

        preAuth.setStatus(PreAuthorization.PreAuthStatus.UNDER_REVIEW);
        preAuth.setReviewer(reviewer);

        PreAuthorization updated = preAuthRepository.save(preAuth);
        log.info("Pre-authorization marked as under review");
        return toDto(updated);
    }

    @Transactional
    public void deletePreAuthorization(Long id) {
        log.info("Deleting pre-authorization with ID: {}", id);

        if (!preAuthRepository.existsById(id)) {
            throw new RuntimeException("Pre-authorization not found with ID: " + id);
        }

        preAuthRepository.deleteById(id);
        log.info("Pre-authorization deleted successfully");
    }

    private String generatePreAuthNumber() {
        return "PA-" + System.currentTimeMillis();
    }

    private PreAuthorizationDto toDto(PreAuthorization entity) {
        return PreAuthorizationDto.builder()
                .id(entity.getId())
                .preAuthNumber(entity.getPreAuthNumber())
                .memberId(entity.getMember().getId())
                .memberName(entity.getMember().getFullName())
                .memberCardNumber(entity.getMember().getCardNumber())
                .providerId(entity.getProviderId())
                .providerName(entity.getProviderName())
                .diagnosisCode(entity.getDiagnosisCode())
                .diagnosisDescription(entity.getDiagnosisDescription())
                .procedureCodes(entity.getProcedureCodes())
                .procedureDescriptions(entity.getProcedureDescriptions())
                .serviceType(entity.getServiceType().name())
                .estimatedCost(entity.getEstimatedCost())
                .approvedAmount(entity.getApprovedAmount())
                .doctorName(entity.getDoctorName())
                .doctorSpecialty(entity.getDoctorSpecialty())
                .requestDate(entity.getRequestDate())
                .expectedServiceDate(entity.getExpectedServiceDate())
                .serviceFromDate(entity.getServiceFromDate())
                .serviceToDate(entity.getServiceToDate())
                .numberOfDays(entity.getNumberOfDays())
                .status(entity.getStatus().name())
                .reviewerId(entity.getReviewer() != null ? entity.getReviewer().getId() : null)
                .reviewerName(entity.getReviewer() != null ? entity.getReviewer().getUsername() : null)
                .reviewedAt(entity.getReviewedAt())
                .approvalExpiryDate(entity.getApprovalExpiryDate())
                .requestNotes(entity.getRequestNotes())
                .reviewerNotes(entity.getReviewerNotes())
                .rejectionReason(entity.getRejectionReason())
                .attachments(entity.getAttachments())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
