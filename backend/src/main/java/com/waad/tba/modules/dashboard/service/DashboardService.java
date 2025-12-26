package com.waad.tba.modules.dashboard.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.entity.OrganizationType;
import com.waad.tba.common.repository.OrganizationRepository;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.dashboard.dto.ClaimsPerDayDto;
import com.waad.tba.modules.dashboard.dto.DashboardStatsDto;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.reviewer.repository.ReviewerCompanyRepository;
import com.waad.tba.security.AuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberRepository memberRepository;
    private final ClaimRepository claimRepository;
    private final EmployerRepository employerRepository;
    private final OrganizationRepository organizationRepository;
    private final ReviewerCompanyRepository reviewerRepository;
    private final AuthorizationService authorizationService;

    /**
     * Get dashboard statistics.
     * 
     * SIMPLIFIED: No employer filtering - shows global stats.
     * Employers are NOT auto-loaded or used for filtering.
     * 
     * @param requestedEmployerId IGNORED - kept for API compatibility
     * @return Dashboard statistics (global)
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getStats(Long requestedEmployerId) {
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("⚠️ No authenticated user for dashboard stats");
            return createEmptyStats();
        }
        
        // SIMPLIFIED: Always return global stats - no employer filtering
        log.debug("📊 Dashboard showing global stats (employer filtering disabled)");
        return getGlobalStats();
    }
    
    /**
     * Get global stats (all data).
     */
    private DashboardStatsDto getGlobalStats() {
        long totalMembers = memberRepository.count();
        long totalClaims = claimRepository.countActive();
        
        // TODO: Add specific query methods for status-based counts
        long pendingClaims = 0;
        long approvedClaims = 0;
        long rejectedClaims = 0;
        
        long totalEmployers = employerRepository.count();
        long totalInsurance = organizationRepository.countByTypeAndActiveTrue(OrganizationType.INSURANCE);
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
    
    /**
     * Create empty stats when user is not authenticated.
     */
    private DashboardStatsDto createEmptyStats() {
        return DashboardStatsDto.builder()
                .totalMembers(0L)
                .totalClaims(0L)
                .pendingClaims(0L)
                .approvedClaims(0L)
                .rejectedClaims(0L)
                .totalEmployers(0L)
                .totalInsuranceCompanies(0L)
                .totalReviewerCompanies(0L)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ClaimsPerDayDto> getClaimsPerDay(Long requestedEmployerId, LocalDate startDate, LocalDate endDate) {
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("⚠️ No authenticated user for claims per day");
            return new java.util.ArrayList<>();
        }
        
        // SIMPLIFIED: No employer filtering
        log.debug("📊 Fetching claims per day from {} to {} (employer filtering disabled)", 
                startDate, endDate);
        
        // TODO: Add daily statistics query methods to ClaimRepository
        return new java.util.ArrayList<>();
    }
}
