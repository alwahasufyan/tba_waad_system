package com.waad.tba.modules.policy.service;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.repository.OrganizationRepository;
import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.policy.dto.PolicyDto;
import com.waad.tba.modules.policy.entity.BenefitPackage;
import com.waad.tba.modules.policy.entity.Policy;
import com.waad.tba.modules.policy.repository.BenefitPackageRepository;
import com.waad.tba.modules.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final EmployerRepository employerRepository;
    private final OrganizationRepository organizationRepository;
    private final BenefitPackageRepository benefitPackageRepository;

    @Transactional(readOnly = true)
    public List<PolicyDto> getAllPolicies() {
        log.info("Fetching all policies");
        return policyRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PolicyDto getPolicyById(Long id) {
        log.info("Fetching policy by ID: {}", id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + id));
        return toDto(policy);
    }

    @Transactional(readOnly = true)
    public PolicyDto getPolicyByNumber(String policyNumber) {
        log.info("Fetching policy by number: {}", policyNumber);
        Policy policy = policyRepository.findByPolicyNumber(policyNumber)
                .orElseThrow(() -> new RuntimeException("Policy not found with number: " + policyNumber));
        return toDto(policy);
    }

    @Transactional(readOnly = true)
    public List<PolicyDto> getPoliciesByEmployer(Long employerId) {
        log.info("Fetching policies for employer ID: {}", employerId);
        return policyRepository.findByEmployerId(employerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PolicyDto> getPoliciesByInsuranceCompany(Long insuranceCompanyId) {
        log.info("Fetching policies for insurance company ID: {}", insuranceCompanyId);
        return policyRepository.findByInsuranceCompanyId(insuranceCompanyId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PolicyDto> getActivePolicies() {
        log.info("Fetching active policies for current date");
        return policyRepository.findActivePoliciesOnDate(LocalDate.now()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PolicyDto createPolicy(PolicyDto dto) {
        log.info("Creating new policy with number: {}", dto.getPolicyNumber());
        
        if (policyRepository.existsByPolicyNumber(dto.getPolicyNumber())) {
            throw new RuntimeException("Policy with number " + dto.getPolicyNumber() + " already exists");
        }

        // Use Organization for employer (new canonical approach)
        Organization employerOrg = organizationRepository.findById(dto.getEmployerId())
                .orElseThrow(() -> new RuntimeException("Employer organization not found with ID: " + dto.getEmployerId()));

        BenefitPackage benefitPackage = benefitPackageRepository.findById(dto.getBenefitPackageId())
                .orElseThrow(() -> new RuntimeException("Benefit package not found with ID: " + dto.getBenefitPackageId()));

        Policy policy = toEntity(dto, employerOrg, benefitPackage);
        Policy saved = policyRepository.save(policy);
        log.info("Policy created successfully with ID: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public PolicyDto updatePolicy(Long id, PolicyDto dto) {
        log.info("Updating policy with ID: {}", id);
        
        Policy existing = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + id));

        if (!existing.getPolicyNumber().equals(dto.getPolicyNumber()) && 
            policyRepository.existsByPolicyNumber(dto.getPolicyNumber())) {
            throw new RuntimeException("Policy with number " + dto.getPolicyNumber() + " already exists");
        }

        // Use Organization for employer (new canonical approach)
        Organization employerOrg = organizationRepository.findById(dto.getEmployerId())
                .orElseThrow(() -> new RuntimeException("Employer organization not found with ID: " + dto.getEmployerId()));

        BenefitPackage benefitPackage = benefitPackageRepository.findById(dto.getBenefitPackageId())
                .orElseThrow(() -> new RuntimeException("Benefit package not found with ID: " + dto.getBenefitPackageId()));

        updateEntityFromDto(existing, dto, employerOrg, benefitPackage);
        Policy updated = policyRepository.save(existing);
        log.info("Policy updated successfully with ID: {}", updated.getId());
        return toDto(updated);
    }

    @Transactional
    public void deletePolicy(Long id) {
        log.info("Deleting policy with ID: {}", id);
        
        if (!policyRepository.existsById(id)) {
            throw new RuntimeException("Policy not found with ID: " + id);
        }

        policyRepository.deleteById(id);
        log.info("Policy deleted successfully with ID: {}", id);
    }

    @Transactional
    public PolicyDto updatePolicyStatus(Long id, String status) {
        log.info("Updating policy status for ID: {} to {}", id, status);
        
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + id));

        policy.setStatus(Policy.PolicyStatus.valueOf(status));
        Policy updated = policyRepository.save(policy);
        log.info("Policy status updated successfully");
        return toDto(updated);
    }

    private PolicyDto toDto(Policy entity) {
        PolicyDto.PolicyDtoBuilder builder = PolicyDto.builder()
                .id(entity.getId())
                .policyNumber(entity.getPolicyNumber())
                .productName(entity.getProductName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .benefitPackageId(entity.getBenefitPackage().getId())
                .benefitPackageName(entity.getBenefitPackage().getNameEn())
                .status(entity.getStatus().name())
                .generalWaitingPeriodDays(entity.getGeneralWaitingPeriodDays())
                .maternityWaitingPeriodDays(entity.getMaternityWaitingPeriodDays())
                .preExistingWaitingPeriodDays(entity.getPreExistingWaitingPeriodDays())
                .totalPolicyLimit(entity.getTotalPolicyLimit())
                .perMemberLimit(entity.getPerMemberLimit())
                .perFamilyLimit(entity.getPerFamilyLimit())
                .totalPremium(entity.getTotalPremium())
                .premiumPerMember(entity.getPremiumPerMember())
                .numberOfLives(entity.getNumberOfLives())
                .numberOfFamilies(entity.getNumberOfFamilies())
                .exclusions(entity.getExclusions())
                .specialConditions(entity.getSpecialConditions())
                .notes(entity.getNotes())
                .active(entity.getActive());
        
        // Use employerOrganization (new canonical)
        if (entity.getEmployerOrganization() != null) {
            builder.employerId(entity.getEmployerOrganization().getId())
                   .employerName(entity.getEmployerOrganization().getName());
        } else if (entity.getEmployer() != null) {
            // Legacy fallback
            builder.employerId(entity.getEmployer().getId())
                   .employerName(entity.getEmployer().getNameAr());
        }
        
        return builder.build();
    }

    private Policy toEntity(PolicyDto dto, Organization employerOrg, BenefitPackage benefitPackage) {
        return Policy.builder()
                .policyNumber(dto.getPolicyNumber())
                .productName(dto.getProductName())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .employerOrganization(employerOrg)
                .benefitPackage(benefitPackage)
                .status(Policy.PolicyStatus.valueOf(dto.getStatus()))
                .generalWaitingPeriodDays(dto.getGeneralWaitingPeriodDays())
                .maternityWaitingPeriodDays(dto.getMaternityWaitingPeriodDays())
                .preExistingWaitingPeriodDays(dto.getPreExistingWaitingPeriodDays())
                .totalPolicyLimit(dto.getTotalPolicyLimit())
                .perMemberLimit(dto.getPerMemberLimit())
                .perFamilyLimit(dto.getPerFamilyLimit())
                .totalPremium(dto.getTotalPremium())
                .premiumPerMember(dto.getPremiumPerMember())
                .numberOfLives(dto.getNumberOfLives())
                .numberOfFamilies(dto.getNumberOfFamilies())
                .exclusions(dto.getExclusions())
                .specialConditions(dto.getSpecialConditions())
                .notes(dto.getNotes())
                .active(dto.getActive())
                .build();
    }

    private void updateEntityFromDto(Policy entity, PolicyDto dto, Organization employerOrg, BenefitPackage benefitPackage) {
        entity.setPolicyNumber(dto.getPolicyNumber());
        entity.setProductName(dto.getProductName());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setEmployerOrganization(employerOrg);
        entity.setBenefitPackage(benefitPackage);
        entity.setStatus(Policy.PolicyStatus.valueOf(dto.getStatus()));
        entity.setGeneralWaitingPeriodDays(dto.getGeneralWaitingPeriodDays());
        entity.setMaternityWaitingPeriodDays(dto.getMaternityWaitingPeriodDays());
        entity.setPreExistingWaitingPeriodDays(dto.getPreExistingWaitingPeriodDays());
        entity.setTotalPolicyLimit(dto.getTotalPolicyLimit());
        entity.setPerMemberLimit(dto.getPerMemberLimit());
        entity.setPerFamilyLimit(dto.getPerFamilyLimit());
        entity.setTotalPremium(dto.getTotalPremium());
        entity.setPremiumPerMember(dto.getPremiumPerMember());
        entity.setNumberOfLives(dto.getNumberOfLives());
        entity.setNumberOfFamilies(dto.getNumberOfFamilies());
        entity.setExclusions(dto.getExclusions());
        entity.setSpecialConditions(dto.getSpecialConditions());
        entity.setNotes(dto.getNotes());
        entity.setActive(dto.getActive());
    }
}
