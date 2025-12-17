package com.waad.tba.modules.provider.mapper;

import com.waad.tba.modules.provider.dto.ProviderContractCreateDto;
import com.waad.tba.modules.provider.dto.ProviderContractUpdateDto;
import com.waad.tba.modules.provider.dto.ProviderContractViewDto;
import com.waad.tba.modules.provider.entity.ProviderContract;
import com.waad.tba.modules.provider.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProviderContractMapper {

    private final ProviderRepository providerRepository;

    public ProviderContract toEntity(ProviderContractCreateDto dto) {
        var provider = providerRepository.findById(dto.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + dto.getProviderId()));

        return ProviderContract.builder()
                .provider(provider)
                .contractNumber(dto.getContractNumber())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .autoRenew(dto.getAutoRenew() != null ? dto.getAutoRenew() : false)
                .discountRate(dto.getDiscountRate())
                .notes(dto.getNotes())
                .active(true)
                .build();
    }

    public void updateEntityFromDto(ProviderContract contract, ProviderContractUpdateDto dto) {
        if (dto.getContractNumber() != null) {
            contract.setContractNumber(dto.getContractNumber());
        }
        if (dto.getStartDate() != null) {
            contract.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            contract.setEndDate(dto.getEndDate());
        }
        if (dto.getAutoRenew() != null) {
            contract.setAutoRenew(dto.getAutoRenew());
        }
        if (dto.getDiscountRate() != null) {
            contract.setDiscountRate(dto.getDiscountRate());
        }
        if (dto.getNotes() != null) {
            contract.setNotes(dto.getNotes());
        }
        if (dto.getActive() != null) {
            contract.setActive(dto.getActive());
        }
    }

    public ProviderContractViewDto toViewDto(ProviderContract contract) {
        return ProviderContractViewDto.builder()
                .id(contract.getId())
                .providerId(contract.getProvider().getId())
                .providerNameArabic(contract.getProvider().getNameArabic())
                .providerNameEnglish(contract.getProvider().getNameEnglish())
                .contractNumber(contract.getContractNumber())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .autoRenew(contract.getAutoRenew())
                .discountRate(contract.getDiscountRate())
                .notes(contract.getNotes())
                .active(contract.getActive())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
