package com.waad.tba.modules.company.service;

import com.waad.tba.modules.company.dto.CompanyDto;
import com.waad.tba.modules.company.entity.Company;
import com.waad.tba.modules.company.mapper.CompanyMapper;
import com.waad.tba.modules.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Company management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    /**
     * Create a new company
     */
    @Transactional
    public CompanyDto createCompany(CompanyDto companyDto) {
        log.info("Creating new company: {}", companyDto.getName());

        // Check if code already exists
        if (companyRepository.existsByCode(companyDto.getCode())) {
            throw new RuntimeException("Company with code '" + companyDto.getCode() + "' already exists");
        }

        Company company = companyMapper.toEntity(companyDto);
        Company savedCompany = companyRepository.save(company);

        log.info("Company created with ID: {}", savedCompany.getId());
        return companyMapper.toDto(savedCompany);
    }

    /**
     * Update an existing company
     */
    @Transactional
    public CompanyDto updateCompany(Long id, CompanyDto companyDto) {
        log.info("Updating company with ID: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        // Check if code is being changed and if new code already exists
        if (!company.getCode().equals(companyDto.getCode()) &&
            companyRepository.existsByCode(companyDto.getCode())) {
            throw new RuntimeException("Company with code '" + companyDto.getCode() + "' already exists");
        }

        companyMapper.updateEntityFromDto(companyDto, company);
        Company updatedCompany = companyRepository.save(company);

        log.info("Company updated: {}", updatedCompany.getId());
        return companyMapper.toDto(updatedCompany);
    }

    /**
     * Get company by ID
     */
    @Transactional(readOnly = true)
    public CompanyDto getCompany(Long id) {
        log.info("Fetching company with ID: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        return companyMapper.toDto(company);
    }

    /**
     * Get company by code
     */
    @Transactional(readOnly = true)
    public CompanyDto getCompanyByCode(String code) {
        log.info("Fetching company with code: {}", code);

        Company company = companyRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Company not found with code: " + code));

        return companyMapper.toDto(company);
    }

    /**
     * Get all companies
     */
    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        log.info("Fetching all companies");

        return companyRepository.findAll().stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Activate a company
     */
    @Transactional
    public CompanyDto activateCompany(Long id) {
        log.info("Activating company with ID: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        company.setActive(true);
        Company updatedCompany = companyRepository.save(company);

        log.info("Company activated: {}", updatedCompany.getId());
        return companyMapper.toDto(updatedCompany);
    }

    /**
     * Deactivate a company
     */
    @Transactional
    public CompanyDto deactivateCompany(Long id) {
        log.info("Deactivating company with ID: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        company.setActive(false);
        Company updatedCompany = companyRepository.save(company);

        log.info("Company deactivated: {}", updatedCompany.getId());
        return companyMapper.toDto(updatedCompany);
    }

    /**
     * Delete a company
     */
    @Transactional
    public void deleteCompany(Long id) {
        log.info("Deleting company with ID: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        companyRepository.delete(company);
        log.info("Company deleted: {}", id);
    }
}
