package com.waad.tba.modules.admin.system;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.claim.entity.Claim;
import com.waad.tba.modules.claim.repository.ClaimRepository;
import com.waad.tba.modules.company.entity.Company;
import com.waad.tba.modules.company.repository.CompanyRepository;
import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import com.waad.tba.modules.insurance.repository.InsuranceCompanyRepository;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.rbac.repository.PermissionRepository;
import com.waad.tba.modules.rbac.repository.RoleRepository;
import com.waad.tba.modules.rbac.repository.UserRepository;
import com.waad.tba.modules.reviewer.entity.ReviewerCompany;
import com.waad.tba.modules.reviewer.repository.ReviewerCompanyRepository;
import com.waad.tba.modules.visit.entity.Visit;
import com.waad.tba.modules.visit.repository.VisitRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemAdminService {

    private final ClaimRepository claimRepository;
    private final VisitRepository visitRepository;
    private final MemberRepository memberRepository;
    private final EmployerRepository employerRepository;
    private final InsuranceCompanyRepository insuranceCompanyRepository;
    private final ReviewerCompanyRepository reviewerCompanyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ApiResponse<Void> resetTestData() {
        log.warn("Resetting test data (excluding RBAC tables)...");
        claimRepository.deleteAll();
        visitRepository.deleteAll();
        memberRepository.deleteAll();
        employerRepository.deleteAll();
        insuranceCompanyRepository.deleteAll();
        reviewerCompanyRepository.deleteAll();
        log.info("Test data cleared.");
        return ApiResponse.success("Test data cleared", null);
    }

    @Transactional
    public ApiResponse<Void> initDefaults() {
        log.info("Initializing default system data...");
        ensurePrimaryTenantCompany();
        // RBAC initialization moved to RbacDataInitializer
        return ApiResponse.success("Defaults initialized", null);
    }

    /**
     * Ensure the primary tenant company (Waad) exists in the system.
     * This is the main TPA company that owns all data.
     * Creates only if not exists (based on code).
     */
    private void ensurePrimaryTenantCompany() {
        String companyCode = "waad";
        
        Optional<Company> existing = companyRepository.findByCode(companyCode);
        
        if (existing.isPresent()) {
            Company company = existing.get();
            log.info("Primary tenant company already exists: ID={}, Code={}, Name={}", 
                company.getId(), company.getCode(), company.getName());
            return;
        }
        
        // Create the primary tenant company
        Company waadCompany = Company.builder()
                .name("شركة وعد لإدارة النفقات الطبية")
                .code(companyCode)
                .active(true)
                .build();
        
        Company savedCompany = companyRepository.save(waadCompany);
        
        log.info("✅ Primary tenant company created successfully!");
        log.info("   Company ID: {}", savedCompany.getId());
        log.info("   Company Code: {}", savedCompany.getCode());
        log.info("   Company Name: {}", savedCompany.getName());
        log.info("   Active: {}", savedCompany.getActive());
        log.info("   Created At: {}", savedCompany.getCreatedAt());
    }

    @Transactional
    public ApiResponse<Void> seedSampleData() {
        log.warn("seedSampleData() is temporarily disabled during Organization migration");
        log.warn("Reason: Member and Claim entities still have FK relationships to legacy Employer/InsuranceCompany tables");
        log.warn("TODO: Re-enable after Member.employer_id and Claim.insurance_company_id are migrated to reference organizations table");
        
        return ApiResponse.success("Seed data temporarily disabled during migration", null);
    }

    // RBAC initialization methods removed - now handled by RbacDataInitializer
}
