package com.waad.tba.modules.insurancepolicy.service;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import com.waad.tba.modules.insurance.repository.InsuranceCompanyRepository;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyCreateDto;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyUpdateDto;
import com.waad.tba.modules.insurancepolicy.dto.InsurancePolicyViewDto;
import com.waad.tba.modules.insurancepolicy.entity.InsurancePolicy;
import com.waad.tba.modules.insurancepolicy.mapper.InsurancePolicyMapper;
import com.waad.tba.modules.insurancepolicy.repository.InsurancePolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsurancePolicyService {

    private final InsurancePolicyRepository insurancePolicyRepository;
    private final InsuranceCompanyRepository insuranceCompanyRepository;
    private final InsurancePolicyMapper insurancePolicyMapper;

    @Transactional
    public InsurancePolicyViewDto createPolicy(InsurancePolicyCreateDto dto) {
        log.info("Creating insurance policy: {}", dto.getName());

        InsuranceCompany insuranceCompany = insuranceCompanyRepository.findById(dto.getInsuranceCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Insurance Company not found with ID: " + dto.getInsuranceCompanyId()));

        InsurancePolicy entity = insurancePolicyMapper.toEntity(dto, insuranceCompany);
        InsurancePolicy saved = insurancePolicyRepository.save(entity);
        
        return insurancePolicyMapper.toViewDto(saved);
    }

    @Transactional
    public InsurancePolicyViewDto updatePolicy(Long id, InsurancePolicyUpdateDto dto) {
        log.info("Updating insurance policy with ID: {}", id);

        InsurancePolicy entity = findEntityById(id);

        InsuranceCompany insuranceCompany = null;
        if (dto.getInsuranceCompanyId() != null) {
            insuranceCompany = insuranceCompanyRepository.findById(dto.getInsuranceCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Insurance Company not found with ID: " + dto.getInsuranceCompanyId()));
        }

        insurancePolicyMapper.updateEntityFromDto(dto, entity, insuranceCompany);
        InsurancePolicy updated = insurancePolicyRepository.save(entity);
        
        return insurancePolicyMapper.toViewDto(updated);
    }

    @Transactional(readOnly = true)
    public InsurancePolicyViewDto getPolicy(Long id) {
        InsurancePolicy entity = findEntityById(id);
        return insurancePolicyMapper.toViewDto(entity);
    }

    @Transactional(readOnly = true)
    public Page<InsurancePolicyViewDto> listPolicies(Pageable pageable, String search) {
        Page<InsurancePolicy> page;
        
        if (search == null || search.isBlank()) {
            page = insurancePolicyRepository.findAllWithCompany(pageable);
        } else {
            page = insurancePolicyRepository.searchPaged(search, pageable);
        }
        
        return page.map(insurancePolicyMapper::toViewDto);
    }

    @Transactional
    public void deletePolicy(Long id) {
        log.info("Soft deleting insurance policy with ID: {}", id);
        
        InsurancePolicy entity = findEntityById(id);
        entity.setActive(false);
        insurancePolicyRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public long count() {
        return insurancePolicyRepository.count();
    }

    private InsurancePolicy findEntityById(Long id) {
        return insurancePolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance Policy not found with ID: " + id));
    }
}
