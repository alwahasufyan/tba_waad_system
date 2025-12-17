package com.waad.tba.modules.dashboard.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.dashboard.dto.ClaimsPerDayDto;
import com.waad.tba.modules.dashboard.dto.DashboardStatsDto;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.insurance.repository.InsuranceCompanyRepository;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.reviewer.repository.ReviewerCompanyRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberRepository memberRepository;
    private final ClaimRepository claimRepository;
    private final EmployerRepository employerRepository;
    private final InsuranceCompanyRepository insuranceRepository;
    private final ReviewerCompanyRepository reviewerRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats(Long employerId) {
        log.debug("Fetching dashboard statistics for employerId: {}", employerId);
        
        long totalMembers;
        long totalClaims;
        long pendingClaims;
        long approvedClaims;
        long rejectedClaims;
        
        if (employerId != null) {
            // Filter by employer
            totalMembers = memberRepository.countByEmployerId(employerId);
            totalClaims = claimRepository.countActive(); // Simplified - use countActive for now
            pendingClaims = 0; // TODO: Add specific query methods
            approvedClaims = 0;
            rejectedClaims = 0;
        } else {
            // Global stats (all employers)
            totalMembers = memberRepository.count();
            totalClaims = claimRepository.countActive();
            pendingClaims = 0; // TODO: Add specific query methods
            approvedClaims = 0;
            rejectedClaims = 0;
        }
        
        long totalEmployers = employerRepository.count();
        long totalInsurance = insuranceRepository.count();
        long totalReviewers = reviewerRepository.count();

        return DashboardStatsDto.builder()
                .totalMembers(totalMembers)
                .totalClaims(totalClaims)
                .pendingClaims(pendingClaims)
                .approvedClaims(approvedClaims)
                .rejectedClaims(rejectedClaims)
                .totalEmployers(totalEmployers)
                .totalInsuranceCompanies(totalInsurance)
                .totalReviewerCompanies(totalReviewers)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ClaimsPerDayDto> getClaimsPerDay(Long employerId, LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching claims per day from {} to {} for employerId: {}", startDate, endDate, employerId);
        
        // TODO: Add daily statistics query methods to ClaimRepository
        return new java.util.ArrayList<>();
    }
}
