package com.waad.tba.modules.provider.service;

import com.waad.tba.modules.provider.dto.ProviderContractCreateDto;
import com.waad.tba.modules.provider.dto.ProviderContractUpdateDto;
import com.waad.tba.modules.provider.dto.ProviderContractViewDto;
import com.waad.tba.modules.provider.entity.ProviderContract;
import com.waad.tba.modules.provider.mapper.ProviderContractMapper;
import com.waad.tba.modules.provider.repository.ProviderContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProviderContractService {

    private final ProviderContractRepository contractRepository;
    private final ProviderContractMapper contractMapper;

    public ProviderContractViewDto createContract(ProviderContractCreateDto dto) {
        if (contractRepository.existsByContractNumber(dto.getContractNumber())) {
            throw new RuntimeException("Contract with number already exists: " + dto.getContractNumber());
        }

        ProviderContract contract = contractMapper.toEntity(dto);
        contract = contractRepository.save(contract);
        return contractMapper.toViewDto(contract);
    }

    public ProviderContractViewDto updateContract(Long id, ProviderContractUpdateDto dto) {
        ProviderContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        contractMapper.updateEntityFromDto(contract, dto);
        contract = contractRepository.save(contract);
        return contractMapper.toViewDto(contract);
    }

    @Transactional(readOnly = true)
    public ProviderContractViewDto getContract(Long id) {
        ProviderContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));
        return contractMapper.toViewDto(contract);
    }

    @Transactional(readOnly = true)
    public Page<ProviderContractViewDto> listContracts(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProviderContract> contracts = contractRepository.searchPaged(search != null ? search : "", pageable);
        return contracts.map(contractMapper::toViewDto);
    }

    public void deleteContract(Long id) {
        ProviderContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));
        contract.setActive(false);
        contractRepository.save(contract);
    }

    @Transactional(readOnly = true)
    public List<ProviderContractViewDto> getContractsByProvider(Long providerId) {
        return contractRepository.findByProviderId(providerId).stream()
                .map(contractMapper::toViewDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countContracts() {
        return contractRepository.countActive();
    }
}
