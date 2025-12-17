package com.waad.tba.modules.provider.mapper;

import org.springframework.stereotype.Component;

import com.waad.tba.modules.provider.dto.ProviderCreateDto;
import com.waad.tba.modules.provider.dto.ProviderSelectorDto;
import com.waad.tba.modules.provider.dto.ProviderUpdateDto;
import com.waad.tba.modules.provider.dto.ProviderViewDto;
import com.waad.tba.modules.provider.entity.Provider;

@Component
public class ProviderMapper {

    public Provider toEntity(ProviderCreateDto dto) {
        return Provider.builder()
                .nameArabic(dto.getNameArabic())
                .nameEnglish(dto.getNameEnglish())
                .licenseNumber(dto.getLicenseNumber())
                .taxNumber(dto.getTaxNumber())
                .city(dto.getCity())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .providerType(dto.getProviderType() != null ? 
                        Provider.ProviderType.valueOf(dto.getProviderType()) : null)
                .contractStartDate(dto.getContractStartDate())
                .contractEndDate(dto.getContractEndDate())
                .defaultDiscountRate(dto.getDefaultDiscountRate())
                .active(true)
                .build();
    }

    public void updateEntityFromDto(Provider provider, ProviderUpdateDto dto) {
        if (dto.getNameArabic() != null) {
            provider.setNameArabic(dto.getNameArabic());
        }
        if (dto.getNameEnglish() != null) {
            provider.setNameEnglish(dto.getNameEnglish());
        }
        if (dto.getLicenseNumber() != null) {
            provider.setLicenseNumber(dto.getLicenseNumber());
        }
        if (dto.getTaxNumber() != null) {
            provider.setTaxNumber(dto.getTaxNumber());
        }
        if (dto.getCity() != null) {
            provider.setCity(dto.getCity());
        }
        if (dto.getAddress() != null) {
            provider.setAddress(dto.getAddress());
        }
        if (dto.getPhone() != null) {
            provider.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            provider.setEmail(dto.getEmail());
        }
        if (dto.getProviderType() != null) {
            provider.setProviderType(Provider.ProviderType.valueOf(dto.getProviderType()));
        }
        if (dto.getContractStartDate() != null) {
            provider.setContractStartDate(dto.getContractStartDate());
        }
        if (dto.getContractEndDate() != null) {
            provider.setContractEndDate(dto.getContractEndDate());
        }
        if (dto.getDefaultDiscountRate() != null) {
            provider.setDefaultDiscountRate(dto.getDefaultDiscountRate());
        }
        if (dto.getActive() != null) {
            provider.setActive(dto.getActive());
        }
    }

    public ProviderViewDto toViewDto(Provider provider) {
        String typeLabel = provider.getProviderType() != null ? 
                getProviderTypeLabel(provider.getProviderType()) : null;
        
        return ProviderViewDto.builder()
                .id(provider.getId())
                .nameArabic(provider.getNameArabic())
                .nameEnglish(provider.getNameEnglish())
                .licenseNumber(provider.getLicenseNumber())
                .taxNumber(provider.getTaxNumber())
                .city(provider.getCity())
                .address(provider.getAddress())
                .phone(provider.getPhone())
                .email(provider.getEmail())
                .providerType(provider.getProviderType() != null ? 
                        provider.getProviderType().name() : null)
                .providerTypeLabel(typeLabel)
                .active(provider.getActive())
                .contractStartDate(provider.getContractStartDate())
                .contractEndDate(provider.getContractEndDate())
                .defaultDiscountRate(provider.getDefaultDiscountRate())
                .createdAt(provider.getCreatedAt())
                .updatedAt(provider.getUpdatedAt())
                .build();
    }

    public ProviderSelectorDto toSelectorDto(Provider provider) {
        if (provider == null) return null;
        
        return ProviderSelectorDto.builder()
                .id(provider.getId())
                .code(provider.getLicenseNumber())
                .nameAr(provider.getNameArabic())
                .nameEn(provider.getNameEnglish())
                .build();
    }

    private String getProviderTypeLabel(Provider.ProviderType type) {
        return switch (type) {
            case HOSPITAL -> "مستشفى";
            case CLINIC -> "عيادة";
            case LAB -> "مختبر";
            case PHARMACY -> "صيدلية";
            case RADIOLOGY -> "أشعة";
        };
    }
}
