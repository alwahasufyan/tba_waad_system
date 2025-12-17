package com.waad.tba.modules.insurancepolicy.service;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageCreateDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageUpdateDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageViewDto;
import com.waad.tba.modules.insurancepolicy.entity.InsurancePolicy;
import com.waad.tba.modules.insurancepolicy.entity.PolicyBenefitPackage;
import com.waad.tba.modules.insurancepolicy.mapper.PolicyBenefitPackageMapper;
import com.waad.tba.modules.insurancepolicy.repository.InsurancePolicyRepository;
import com.waad.tba.modules.insurancepolicy.repository.PolicyBenefitPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyBenefitPackageService {

    private final PolicyBenefitPackageRepository benefitPackageRepository;
    private final InsurancePolicyRepository insurancePolicyRepository;
    private final PolicyBenefitPackageMapper benefitPackageMapper;

    @Transactional
    public PolicyBenefitPackageViewDto createBenefitPackage(Long policyId, PolicyBenefitPackageCreateDto dto) {
        log.info("Creating benefit package for policy ID: {}", policyId);

        InsurancePolicy policy = insurancePolicyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance Policy not found with ID: " + policyId));

        PolicyBenefitPackage entity = benefitPackageMapper.toEntity(dto, policy);
        PolicyBenefitPackage saved = benefitPackageRepository.save(entity);
        
        return benefitPackageMapper.toViewDto(saved);
    }

    @Transactional
    public PolicyBenefitPackageViewDto updateBenefitPackage(Long id, PolicyBenefitPackageUpdateDto dto) {
        log.info("Updating benefit package with ID: {}", id);

        PolicyBenefitPackage entity = findEntityById(id);
        benefitPackageMapper.updateEntityFromDto(dto, entity);
        PolicyBenefitPackage updated = benefitPackageRepository.save(entity);
        
        return benefitPackageMapper.toViewDto(updated);
    }

    @Transactional(readOnly = true)
    public PolicyBenefitPackageViewDto getBenefitPackage(Long id) {
        PolicyBenefitPackage entity = findEntityById(id);
        return benefitPackageMapper.toViewDto(entity);
    }

    @Transactional(readOnly = true)
    public List<PolicyBenefitPackageViewDto> listBenefitPackagesByPolicy(Long policyId) {
        return benefitPackageRepository.findByInsurancePolicyId(policyId).stream()
                .map(benefitPackageMapper::toViewDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteBenefitPackage(Long id) {
        log.info("Soft deleting benefit package with ID: {}", id);
        
        PolicyBenefitPackage entity = findEntityById(id);
        entity.setActive(false);
        benefitPackageRepository.save(entity);
    }

    private PolicyBenefitPackage findEntityById(Long id) {
        return benefitPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefit Package not found with ID: " + id));
    }
}
