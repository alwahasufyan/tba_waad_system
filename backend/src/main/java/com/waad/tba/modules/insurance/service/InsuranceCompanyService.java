package com.waad.tba.modules.insurance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.enums.OrganizationType;
import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.common.repository.OrganizationRepository;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyCreateDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyResponseDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanySelectorDto;
import com.waad.tba.modules.insurance.dto.InsuranceCompanyUpdateDto;
import com.waad.tba.modules.insurance.mapper.InsuranceCompanyMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Insurance Company Service - Uses Organization Entity (CANONICAL)
 * 
 * This service is a facade over {@link Organization} with type=INSURANCE.
 * All CRUD operations work with Organization table only.
 * 
 * ✅ READS: OrganizationRepository.findByType(INSURANCE)
 * ✅ WRITES: OrganizationRepository.save() with type=INSURANCE
 * ❌ NEVER uses legacy InsuranceCompanyRepository for writes
 * 
 * @see Organization
 * @see OrganizationType#INSURANCE
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InsuranceCompanyService {

    private final OrganizationRepository organizationRepository;
    private final InsuranceCompanyMapper insuranceCompanyMapper;

    public List<InsuranceCompanySelectorDto> getSelectorOptions() {
        return organizationRepository.findByTypeAndActiveTrue(OrganizationType.INSURANCE).stream()
                .map(insuranceCompanyMapper::toSelectorDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InsuranceCompanyResponseDto create(InsuranceCompanyCreateDto dto) {
        log.info("Creating new insurance company: {}", dto.getName());
        Organization entity = insuranceCompanyMapper.toEntity(dto);
        entity.setType(OrganizationType.INSURANCE);
        entity.setActive(true);
        Organization saved = organizationRepository.save(entity);
        return insuranceCompanyMapper.toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InsuranceCompanyResponseDto> getAll() {
        return organizationRepository.findByTypeAndActiveTrue(OrganizationType.INSURANCE).stream()
                .map(insuranceCompanyMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InsuranceCompanyResponseDto> getAllPaginated(Pageable pageable) {
        return organizationRepository.findByTypeAndActiveTrue(OrganizationType.INSURANCE, pageable)
                .map(insuranceCompanyMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<InsuranceCompanyResponseDto> findAllPaginated(Pageable pageable, String search) {
        if (search == null || search.isBlank()) {
            return organizationRepository.findByTypeAndActiveTrue(OrganizationType.INSURANCE, pageable)
                    .map(insuranceCompanyMapper::toResponseDto);
        } else {
            return organizationRepository.searchPagedByType(search, OrganizationType.INSURANCE, pageable)
                    .map(insuranceCompanyMapper::toResponseDto);
        }
    }

    @Transactional(readOnly = true)
    public InsuranceCompanyResponseDto getById(Long id) {
        Organization entity = findEntityById(id);
        return insuranceCompanyMapper.toResponseDto(entity);
    }

    @Transactional
    public InsuranceCompanyResponseDto update(Long id, InsuranceCompanyUpdateDto dto) {
        log.info("Updating insurance company with ID: {}", id);
        Organization entity = findEntityById(id);
        insuranceCompanyMapper.updateEntityFromDto(dto, entity);
        Organization updated = organizationRepository.save(entity);
        return insuranceCompanyMapper.toResponseDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Soft deleting insurance company with ID: {}", id);
        Organization entity = findEntityById(id);
        entity.setActive(false);
        organizationRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<InsuranceCompanyResponseDto> search(String searchTerm) {
        return organizationRepository.searchByType(searchTerm, OrganizationType.INSURANCE).stream()
                .map(insuranceCompanyMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long count() {
        return organizationRepository.findByType(OrganizationType.INSURANCE).size();
    }

    private Organization findEntityById(Long id) {
        return organizationRepository.findById(id)
                .filter(org -> org.getType() == OrganizationType.INSURANCE)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance Company not found with ID: " + id));
    }
}
