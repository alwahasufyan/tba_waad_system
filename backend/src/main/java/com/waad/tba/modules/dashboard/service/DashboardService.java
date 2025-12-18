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
    private final InsuranceCompanyRepository insuranceRepository;
    private final ReviewerCompanyRepository reviewerRepository;
    private final AuthorizationService authorizationService;

    /**
     * Get dashboard statistics with data-level filtering.
     * 
     * NOTE: The employerId parameter from frontend is for UI filtering ONLY.
     * Backend applies filtering based on user's actual permissions.
     * 
     * @param requestedEmployerId Employer ID from frontend (UI filter) - may be ignored
     * @return Dashboard statistics
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getStats(Long requestedEmployerId) {
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("⚠️ No authenticated user for dashboard stats");
            return createEmptyStats();
        }
        
        // Get actual employer filter based on user's permissions
        // This OVERRIDES the frontend filter for EMPLOYER_ADMIN users
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        
        if (employerFilter != null) {
            // EMPLOYER_ADMIN: Show only their employer's stats
            log.debug("🔒 Dashboard filtered by employerId={}", employerFilter);
            return getStatsForEmployer(employerFilter);
        } else {
            // SUPER_ADMIN / INSURANCE_ADMIN: Show stats based on UI filter
            if (requestedEmployerId != null) {
                log.debug("🔓 Dashboard showing stats for requested employerId={}", requestedEmployerId);
                return getStatsForEmployer(requestedEmployerId);
            } else {
                log.debug("🔓 Dashboard showing global stats");
                return getGlobalStats();
            }
        }
    }
    
    /**
     * Get stats for a specific employer.
     */
    private DashboardStatsDto getStatsForEmployer(Long employerId) {
        long totalMembers = memberRepository.countByEmployerId(employerId);
        long totalClaims = claimRepository.countByMemberEmployerId(employerId);
        
        // TODO: Add specific query methods for status-based counts
        long pendingClaims = 0;
        long approvedClaims = 0;
        long rejectedClaims = 0;
        
        long totalEmployers = 1; // Filtered view shows only 1 employer
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
    
    /**
     * Get global stats (all employers).
     */
    private DashboardStatsDto getGlobalStats() {
        long totalMembers = memberRepository.count();
        long totalClaims = claimRepository.countActive();
        
        // TODO: Add specific query methods for status-based counts
        long pendingClaims = 0;
        long approvedClaims = 0;
        long rejectedClaims = 0;
        
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
        
        // Get actual employer filter based on user's permissions
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        Long effectiveEmployerId = employerFilter != null ? employerFilter : requestedEmployerId;
        
        log.debug("📊 Fetching claims per day from {} to {} for employerId: {}", 
                startDate, endDate, effectiveEmployerId);
        
        // TODO: Add daily statistics query methods to ClaimRepository
        return new java.util.ArrayList<>();
    }
}
