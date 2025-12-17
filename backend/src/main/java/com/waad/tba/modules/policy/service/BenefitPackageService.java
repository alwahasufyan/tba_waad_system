package com.waad.tba.modules.policy.service;

import com.waad.tba.modules.policy.dto.BenefitPackageDto;
import com.waad.tba.modules.policy.entity.BenefitPackage;
import com.waad.tba.modules.policy.repository.BenefitPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BenefitPackageService {

    private final BenefitPackageRepository benefitPackageRepository;

    @Transactional(readOnly = true)
    public List<BenefitPackageDto> getAllBenefitPackages() {
        log.info("Fetching all benefit packages");
        return benefitPackageRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BenefitPackageDto> getActiveBenefitPackages() {
        log.info("Fetching active benefit packages");
        return benefitPackageRepository.findByActive(true).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BenefitPackageDto getBenefitPackageById(Long id) {
        log.info("Fetching benefit package by ID: {}", id);
        BenefitPackage benefitPackage = benefitPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Benefit package not found with ID: " + id));
        return toDto(benefitPackage);
    }

    @Transactional(readOnly = true)
    public BenefitPackageDto getBenefitPackageByCode(String code) {
        log.info("Fetching benefit package by code: {}", code);
        BenefitPackage benefitPackage = benefitPackageRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Benefit package not found with code: " + code));
        return toDto(benefitPackage);
    }

    @Transactional
    public BenefitPackageDto createBenefitPackage(BenefitPackageDto dto) {
        log.info("Creating new benefit package with code: {}", dto.getCode());
        
        if (benefitPackageRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Benefit package with code " + dto.getCode() + " already exists");
        }

        BenefitPackage benefitPackage = toEntity(dto);
        BenefitPackage saved = benefitPackageRepository.save(benefitPackage);
        log.info("Benefit package created successfully with ID: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public BenefitPackageDto updateBenefitPackage(Long id, BenefitPackageDto dto) {
        log.info("Updating benefit package with ID: {}", id);
        
        BenefitPackage existing = benefitPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Benefit package not found with ID: " + id));

        if (!existing.getCode().equals(dto.getCode()) && 
            benefitPackageRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Benefit package with code " + dto.getCode() + " already exists");
        }

        updateEntityFromDto(existing, dto);
        BenefitPackage updated = benefitPackageRepository.save(existing);
        log.info("Benefit package updated successfully with ID: {}", updated.getId());
        return toDto(updated);
    }

    @Transactional
    public void deleteBenefitPackage(Long id) {
        log.info("Deleting benefit package with ID: {}", id);
        
        if (!benefitPackageRepository.existsById(id)) {
            throw new RuntimeException("Benefit package not found with ID: " + id);
        }

        benefitPackageRepository.deleteById(id);
        log.info("Benefit package deleted successfully with ID: {}", id);
    }

    private BenefitPackageDto toDto(BenefitPackage entity) {
        return BenefitPackageDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nameAr(entity.getNameAr())
                .nameEn(entity.getNameEn())
                .description(entity.getDescription())
                .opCoverageLimit(entity.getOpCoverageLimit())
                .opCoPaymentPercentage(entity.getOpCoPaymentPercentage())
                .ipCoverageLimit(entity.getIpCoverageLimit())
                .ipCoPaymentPercentage(entity.getIpCoPaymentPercentage())
                .maternityCovered(entity.getMaternityCovered())
                .maternityCoverageLimit(entity.getMaternityCoverageLimit())
                .dentalCovered(entity.getDentalCovered())
                .dentalCoverageLimit(entity.getDentalCoverageLimit())
                .opticalCovered(entity.getOpticalCovered())
                .opticalCoverageLimit(entity.getOpticalCoverageLimit())
                .pharmacyCovered(entity.getPharmacyCovered())
                .pharmacyCoverageLimit(entity.getPharmacyCoverageLimit())
                .annualLimitPerMember(entity.getAnnualLimitPerMember())
                .lifetimeLimitPerMember(entity.getLifetimeLimitPerMember())
                .emergencyCovered(entity.getEmergencyCovered())
                .chronicDiseaseCovered(entity.getChronicDiseaseCovered())
                .preExistingConditionsCovered(entity.getPreExistingConditionsCovered())
                .limitRulesJson(entity.getLimitRulesJson())
                .active(entity.getActive())
                .build();
    }

    private BenefitPackage toEntity(BenefitPackageDto dto) {
        return BenefitPackage.builder()
                .code(dto.getCode())
                .nameAr(dto.getNameAr())
                .nameEn(dto.getNameEn())
                .description(dto.getDescription())
                .opCoverageLimit(dto.getOpCoverageLimit())
                .opCoPaymentPercentage(dto.getOpCoPaymentPercentage())
                .ipCoverageLimit(dto.getIpCoverageLimit())
                .ipCoPaymentPercentage(dto.getIpCoPaymentPercentage())
                .maternityCovered(dto.getMaternityCovered())
                .maternityCoverageLimit(dto.getMaternityCoverageLimit())
                .dentalCovered(dto.getDentalCovered())
                .dentalCoverageLimit(dto.getDentalCoverageLimit())
                .opticalCovered(dto.getOpticalCovered())
                .opticalCoverageLimit(dto.getOpticalCoverageLimit())
                .pharmacyCovered(dto.getPharmacyCovered())
                .pharmacyCoverageLimit(dto.getPharmacyCoverageLimit())
                .annualLimitPerMember(dto.getAnnualLimitPerMember())
                .lifetimeLimitPerMember(dto.getLifetimeLimitPerMember())
                .emergencyCovered(dto.getEmergencyCovered())
                .chronicDiseaseCovered(dto.getChronicDiseaseCovered())
                .preExistingConditionsCovered(dto.getPreExistingConditionsCovered())
                .limitRulesJson(dto.getLimitRulesJson())
                .active(dto.getActive())
                .build();
    }

    private void updateEntityFromDto(BenefitPackage entity, BenefitPackageDto dto) {
        entity.setCode(dto.getCode());
        entity.setNameAr(dto.getNameAr());
        entity.setNameEn(dto.getNameEn());
        entity.setDescription(dto.getDescription());
        entity.setOpCoverageLimit(dto.getOpCoverageLimit());
        entity.setOpCoPaymentPercentage(dto.getOpCoPaymentPercentage());
        entity.setIpCoverageLimit(dto.getIpCoverageLimit());
        entity.setIpCoPaymentPercentage(dto.getIpCoPaymentPercentage());
        entity.setMaternityCovered(dto.getMaternityCovered());
        entity.setMaternityCoverageLimit(dto.getMaternityCoverageLimit());
        entity.setDentalCovered(dto.getDentalCovered());
        entity.setDentalCoverageLimit(dto.getDentalCoverageLimit());
        entity.setOpticalCovered(dto.getOpticalCovered());
        entity.setOpticalCoverageLimit(dto.getOpticalCoverageLimit());
        entity.setPharmacyCovered(dto.getPharmacyCovered());
        entity.setPharmacyCoverageLimit(dto.getPharmacyCoverageLimit());
        entity.setAnnualLimitPerMember(dto.getAnnualLimitPerMember());
        entity.setLifetimeLimitPerMember(dto.getLifetimeLimitPerMember());
        entity.setEmergencyCovered(dto.getEmergencyCovered());
        entity.setChronicDiseaseCovered(dto.getChronicDiseaseCovered());
        entity.setPreExistingConditionsCovered(dto.getPreExistingConditionsCovered());
        entity.setLimitRulesJson(dto.getLimitRulesJson());
        entity.setActive(dto.getActive());
    }
}
