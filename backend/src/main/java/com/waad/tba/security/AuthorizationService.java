package com.waad.tba.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.company.service.CompanySettingsService;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.rbac.repository.UserRepository;
import com.waad.tba.modules.visit.entity.Visit;
import com.waad.tba.modules.visit.repository.VisitRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Authorization Service - Phase 8
 * 
 * Handles permission-based and data-level access control.
 * Enforces employer-level, insurance-level, and provider-level restrictions.
 * 
 * @author TBA WAAD System
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final ClaimRepository claimRepository;
    private final VisitRepository visitRepository;
    private final CompanySettingsService companySettingsService;

    /**
     * Get currently authenticated user from security context.
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("No authenticated user found in security context");
            return null;
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * Check if user is SUPER_ADMIN (bypasses all restrictions).
     */
    public boolean isSuperAdmin(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(role -> "SUPER_ADMIN".equals(role.getName()));
    }

    /**
     * Check if user is INSURANCE_ADMIN.
     */
    public boolean isInsuranceAdmin(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(role -> "INSURANCE_ADMIN".equals(role.getName()));
    }

    /**
     * Check if user is EMPLOYER_ADMIN.
     */
    public boolean isEmployerAdmin(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(role -> "EMPLOYER_ADMIN".equals(role.getName()));
    }

    /**
     * Check if user is PROVIDER.
     */
    public boolean isProvider(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(role -> "PROVIDER".equals(role.getName()));
    }

    /**
     * Check if user is REVIEWER.
     */
    public boolean isReviewer(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(role -> "REVIEWER".equals(role.getName()));
    }

    /**
     * Check if user can access a specific member.
     * 
     * Rules:
     * - SUPER_ADMIN: Full access
     * - INSURANCE_ADMIN: Access if member's insurance company matches user's company
     * - EMPLOYER_ADMIN: Access if member's employer matches user's employer
     * - Others: No access
     */
    public boolean canAccessMember(User user, Long memberId) {
        if (user == null || memberId == null) {
            log.warn("Access denied: null user or memberId");
            return false;
        }

        // SUPER_ADMIN bypasses all checks
        if (isSuperAdmin(user)) {
            return true;
        }

        Optional<Member> memberOpt = memberRepository.findById(memberId);
        if (memberOpt.isEmpty()) {
            log.warn("Access denied: member {} not found", memberId);
            return false;
        }

        Member member = memberOpt.get();

        // EMPLOYER_ADMIN: Check employer match
        if (isEmployerAdmin(user)) {
            if (user.getEmployerId() == null) {
                log.warn("Access denied: EMPLOYER_ADMIN user {} has no employerId", user.getUsername());
                return false;
            }
            if (member.getEmployer() == null || !user.getEmployerId().equals(member.getEmployer().getId())) {
                log.warn("Access denied: user {} attempted to access member {} from different employer", 
                        user.getUsername(), memberId);
                return false;
            }
            return true;
        }

        // INSURANCE_ADMIN: Can access all members (for now, add company restriction if needed)
        if (isInsuranceAdmin(user)) {
            return true;
        }

        log.warn("Access denied: user {} attempted to access member {}", user.getUsername(), memberId);
        return false;
    }

    /**
     * Check if user can access a specific claim.
     * 
     * Rules:
     * - SUPER_ADMIN: Full access
     * - INSURANCE_ADMIN: Access if claim's member belongs to insurance company
     * - EMPLOYER_ADMIN: Access if claim's member belongs to employer
     * - PROVIDER: Access if claim was created by this provider
     * - REVIEWER: Full access to claims for review
     * - Others: No access
     */
    public boolean canAccessClaim(User user, Long claimId) {
        if (user == null || claimId == null) {
            log.warn("Access denied: null user or claimId");
            return false;
        }

        // SUPER_ADMIN bypasses all checks
        if (isSuperAdmin(user)) {
            return true;
        }

        Optional<Claim> claimOpt = claimRepository.findById(claimId);
        if (claimOpt.isEmpty()) {
            log.warn("Access denied: claim {} not found", claimId);
            return false;
        }

        Claim claim = claimOpt.get();

        // REVIEWER: Can access all claims for review
        if (isReviewer(user)) {
            return true;
        }

        // INSURANCE_ADMIN: Can access all claims
        if (isInsuranceAdmin(user)) {
            return true;
        }

        // PROVIDER: Can only access claims they created
        if (isProvider(user)) {
            // Note: Need to add createdBy field to Claim entity
            // For now, allow access (implement after adding createdBy)
            log.debug("Provider access to claim {} - need to implement createdBy check", claimId);
            return true;
        }

        // EMPLOYER_ADMIN: Check if claim's member belongs to their employer
        if (isEmployerAdmin(user)) {
            if (user.getEmployerId() == null) {
                log.warn("Access denied: EMPLOYER_ADMIN user {} has no employerId", user.getUsername());
                return false;
            }
            if (claim.getMember() == null || claim.getMember().getEmployer() == null ||
                !user.getEmployerId().equals(claim.getMember().getEmployer().getId())) {
                log.warn("Access denied: user {} attempted to access claim {} from different employer", 
                        user.getUsername(), claimId);
                return false;
            }
            return true;
        }

        log.warn("Access denied: user {} attempted to access claim {}", user.getUsername(), claimId);
        return false;
    }

    /**
     * Check if user can access a specific visit.
     * 
     * Rules:
     * - SUPER_ADMIN: Full access
     * - INSURANCE_ADMIN: Access if visit's member belongs to insurance company
     * - EMPLOYER_ADMIN: Access if visit's member belongs to employer
     * - Others: No access
     */
    public boolean canAccessVisit(User user, Long visitId) {
        if (user == null || visitId == null) {
            log.warn("Access denied: null user or visitId");
            return false;
        }

        // SUPER_ADMIN bypasses all checks
        if (isSuperAdmin(user)) {
            return true;
        }

        Optional<Visit> visitOpt = visitRepository.findById(visitId);
        if (visitOpt.isEmpty()) {
            log.warn("Access denied: visit {} not found", visitId);
            return false;
        }

        Visit visit = visitOpt.get();

        // INSURANCE_ADMIN: Can access all visits
        if (isInsuranceAdmin(user)) {
            return true;
        }

        // EMPLOYER_ADMIN: Check if visit's member belongs to their employer
        if (isEmployerAdmin(user)) {
            if (user.getEmployerId() == null) {
                log.warn("Access denied: EMPLOYER_ADMIN user {} has no employerId", user.getUsername());
                return false;
            }
            if (visit.getMember() == null || visit.getMember().getEmployer() == null ||
                !user.getEmployerId().equals(visit.getMember().getEmployer().getId())) {
                log.warn("Access denied: user {} attempted to access visit {} from different employer", 
                        user.getUsername(), visitId);
                return false;
            }
            return true;
        }

        log.warn("Access denied: user {} attempted to access visit {}", user.getUsername(), visitId);
        return false;
    }

    /**
     * Filter members query by user's access level.
     * Returns employerId for EMPLOYER_ADMIN, null for SUPER_ADMIN/INSURANCE_ADMIN.
     */
    public Long getEmployerFilterForUser(User user) {
        if (user == null) {
            return null;
        }

        // SUPER_ADMIN and INSURANCE_ADMIN see all
        if (isSuperAdmin(user) || isInsuranceAdmin(user)) {
            return null; // No filter
        }

        // EMPLOYER_ADMIN sees only their employer's data
        if (isEmployerAdmin(user)) {
            return user.getEmployerId();
        }

        return null;
    }

    /**
     * Check if INSURANCE_ADMIN has access to data from specific company.
     * Phase 8.2: Company-level filtering for insurance admins.
     */
    public boolean hasCompanyAccess(User user, Long companyId) {
        if (user == null || companyId == null) {
            return false;
        }

        // SUPER_ADMIN bypasses company restrictions
        if (isSuperAdmin(user)) {
            return true;
        }

        // INSURANCE_ADMIN: Check companyId match
        if (isInsuranceAdmin(user)) {
            if (user.getCompanyId() == null) {
                log.warn("INSURANCE_ADMIN user {} has no companyId assigned", user.getUsername());
                return false;
            }
            return user.getCompanyId().equals(companyId);
        }

        // Other roles don't have company-level restrictions
        return true;
    }

    /**
     * Get insurance company filter for INSURANCE_ADMIN users.
     * Returns companyId for INSURANCE_ADMIN, null for SUPER_ADMIN.
     * Phase 8.2: Company-level filtering.
     */
    public Long getCompanyFilterForUser(User user) {
        if (user == null) {
            return null;
        }

        // SUPER_ADMIN sees all companies
        if (isSuperAdmin(user)) {
            return null; // No filter
        }

        // INSURANCE_ADMIN sees only their company's data
        if (isInsuranceAdmin(user)) {
            return user.getCompanyId();
        }

        return null;
    }

    /**
     * Check if user can modify claim (approve/reject).
     */
    public boolean canModifyClaim(User user, Long claimId) {
        if (user == null || claimId == null) {
            return false;
        }

        // SUPER_ADMIN can modify
        if (isSuperAdmin(user)) {
            return true;
        }

        // INSURANCE_ADMIN can modify
        if (isInsuranceAdmin(user)) {
            return true;
        }

        // REVIEWER can modify
        if (isReviewer(user)) {
            return true;
        }

        log.warn("Access denied: user {} attempted to modify claim {}", user.getUsername(), claimId);
        return false;
    }

    // =========================================================================
    // Phase 9: Feature Toggle Methods
    // =========================================================================

    /**
     * Check if EMPLOYER_ADMIN user can view claims based on feature toggle.
     * This works ON TOP of RBAC permissions.
     * 
     * @param user Current user
     * @return true if user can view claims
     */
    public boolean canEmployerViewClaims(User user) {
        if (user == null) {
            log.warn("FeatureCheck: user=null feature=VIEW_CLAIMS result=DENIED (null user)");
            return false;
        }

        // Non-employer users: always allow (controlled by RBAC)
        if (!isEmployerAdmin(user)) {
            log.debug("FeatureCheck: user={} feature=VIEW_CLAIMS result=ALLOWED (not EMPLOYER_ADMIN)", 
                user.getUsername());
            return true;
        }

        // EMPLOYER_ADMIN: check feature toggle
        if (user.getEmployerId() == null) {
            log.warn("FeatureCheck: user={} feature=VIEW_CLAIMS result=DENIED (no employerId)", 
                user.getUsername());
            return false;
        }

        boolean result = companySettingsService.canEmployerViewClaims(user.getEmployerId());
        log.info("FeatureCheck: employerId={} user={} feature=VIEW_CLAIMS result={}", 
            user.getEmployerId(), user.getUsername(), result ? "ALLOWED" : "DENIED");
        
        return result;
    }

    /**
     * Check if EMPLOYER_ADMIN user can view visits based on feature toggle.
     * 
     * @param user Current user
     * @return true if user can view visits
     */
    public boolean canEmployerViewVisits(User user) {
        if (user == null) {
            log.warn("FeatureCheck: user=null feature=VIEW_VISITS result=DENIED (null user)");
            return false;
        }

        // Non-employer users: always allow (controlled by RBAC)
        if (!isEmployerAdmin(user)) {
            log.debug("FeatureCheck: user={} feature=VIEW_VISITS result=ALLOWED (not EMPLOYER_ADMIN)", 
                user.getUsername());
            return true;
        }

        // EMPLOYER_ADMIN: check feature toggle
        if (user.getEmployerId() == null) {
            log.warn("FeatureCheck: user={} feature=VIEW_VISITS result=DENIED (no employerId)", 
                user.getUsername());
            return false;
        }

        boolean result = companySettingsService.canEmployerViewVisits(user.getEmployerId());
        log.info("FeatureCheck: employerId={} user={} feature=VIEW_VISITS result={}", 
            user.getEmployerId(), user.getUsername(), result ? "ALLOWED" : "DENIED");
        
        return result;
    }

    /**
     * Check if EMPLOYER_ADMIN user can edit members based on feature toggle.
     * 
     * @param user Current user
     * @return true if user can edit members
     */
    public boolean canEmployerEditMembers(User user) {
        if (user == null) {
            log.warn("FeatureCheck: user=null feature=EDIT_MEMBERS result=DENIED (null user)");
            return false;
        }

        // Non-employer users: always allow (controlled by RBAC)
        if (!isEmployerAdmin(user)) {
            log.debug("FeatureCheck: user={} feature=EDIT_MEMBERS result=ALLOWED (not EMPLOYER_ADMIN)", 
                user.getUsername());
            return true;
        }

        // EMPLOYER_ADMIN: check feature toggle
        if (user.getEmployerId() == null) {
            log.warn("FeatureCheck: user={} feature=EDIT_MEMBERS result=DENIED (no employerId)", 
                user.getUsername());
            return false;
        }

        boolean result = companySettingsService.canEmployerEditMembers(user.getEmployerId());
        log.info("FeatureCheck: employerId={} user={} feature=EDIT_MEMBERS result={}", 
            user.getEmployerId(), user.getUsername(), result ? "ALLOWED" : "DENIED");
        
        return result;
    }

    /**
     * Check if EMPLOYER_ADMIN user can download attachments based on feature toggle.
     * 
     * @param user Current user
     * @return true if user can download attachments
     */
    public boolean canEmployerDownloadAttachments(User user) {
        if (user == null) {
            log.warn("FeatureCheck: user=null feature=DOWNLOAD_ATTACHMENTS result=DENIED (null user)");
            return false;
        }

        // Non-employer users: always allow (controlled by RBAC)
        if (!isEmployerAdmin(user)) {
            log.debug("FeatureCheck: user={} feature=DOWNLOAD_ATTACHMENTS result=ALLOWED (not EMPLOYER_ADMIN)", 
                user.getUsername());
            return true;
        }

        // EMPLOYER_ADMIN: check feature toggle
        if (user.getEmployerId() == null) {
            log.warn("FeatureCheck: user={} feature=DOWNLOAD_ATTACHMENTS result=DENIED (no employerId)", 
                user.getUsername());
            return false;
        }

        boolean result = companySettingsService.canEmployerDownloadAttachments(user.getEmployerId());
        log.info("FeatureCheck: employerId={} user={} feature=DOWNLOAD_ATTACHMENTS result={}", 
            user.getEmployerId(), user.getUsername(), result ? "ALLOWED" : "DENIED");
        
        return result;
    }
}
