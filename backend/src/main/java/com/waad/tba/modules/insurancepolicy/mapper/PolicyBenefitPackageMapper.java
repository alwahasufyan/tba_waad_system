package com.waad.tba.modules.insurancepolicy.mapper;

import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageCreateDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageUpdateDto;
import com.waad.tba.modules.insurancepolicy.dto.PolicyBenefitPackageViewDto;
import com.waad.tba.modules.insurancepolicy.entity.InsurancePolicy;
import com.waad.tba.modules.insurancepolicy.entity.PolicyBenefitPackage;
import org.springframework.stereotype.Component;

@Component
public class PolicyBenefitPackageMapper {

    public PolicyBenefitPackageViewDto toViewDto(PolicyBenefitPackage entity) {
        if (entity == null) return null;

        return PolicyBenefitPackageViewDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .maxLimit(entity.getMaxLimit())
                .copayPercentage(entity.getCopayPercentage())
                .coverageDescription(entity.getCoverageDescription())
                .active(entity.getActive())
                .insurancePolicyId(entity.getInsurancePolicy() != null ? entity.getInsurancePolicy().getId() : null)
                .insurancePolicyName(entity.getInsurancePolicy() != null ? entity.getInsurancePolicy().getName() : null)
                .insurancePolicyCode(entity.getInsurancePolicy() != null ? entity.getInsurancePolicy().getCode() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PolicyBenefitPackage toEntity(PolicyBenefitPackageCreateDto dto, InsurancePolicy insurancePolicy) {
        if (dto == null) return null;

        return PolicyBenefitPackage.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .maxLimit(dto.getMaxLimit())
                .copayPercentage(dto.getCopayPercentage())
                .coverageDescription(dto.getCoverageDescription())
                .insurancePolicy(insurancePolicy)
                .active(Boolean.TRUE.equals(dto.getActive()))
                .build();
    }

    public void updateEntityFromDto(PolicyBenefitPackageUpdateDto dto, PolicyBenefitPackage entity) {
        if (dto == null) return;

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getCode() != null) entity.setCode(dto.getCode());
        if (dto.getMaxLimit() != null) entity.setMaxLimit(dto.getMaxLimit());
        if (dto.getCopayPercentage() != null) entity.setCopayPercentage(dto.getCopayPercentage());
        if (dto.getCoverageDescription() != null) entity.setCoverageDescription(dto.getCoverageDescription());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
    }
}
