package com.waad.tba.modules.medicalservice;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.medicalcategory.MedicalCategory;
import com.waad.tba.modules.medicalcategory.MedicalCategoryRepository;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceCreateDto;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceSelectorDto;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceUpdateDto;
import com.waad.tba.modules.medicalservice.dto.MedicalServiceViewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicalServiceService {

    private final MedicalServiceRepository repo;
    private final MedicalCategoryRepository categoryRepository;

    public List<MedicalServiceSelectorDto> getSelectorOptions() {
        return repo.findAll().stream()
                .map(MedicalServiceMapper::toSelectorDto)
                .collect(Collectors.toList());
    }

    public Page<MedicalServiceViewDto> findAllPaginated(Pageable pageable, String search) {
        Page<MedicalService> page = repo.findAllWithSearch(search, pageable);
        return page.map(MedicalServiceMapper::toViewDto);
    }

    public MedicalServiceViewDto findById(Long id) {
        MedicalService entity = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Service not found with id: " + id));
        return MedicalServiceMapper.toViewDto(entity);
    }

    @Transactional
    public MedicalServiceViewDto create(MedicalServiceCreateDto dto) {
        MedicalCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Medical Category not found with id: " + dto.getCategoryId()));
        
        MedicalService entity = MedicalServiceMapper.toEntity(dto, category);
        MedicalService saved = repo.save(entity);
        return MedicalServiceMapper.toViewDto(saved);
    }

    @Transactional
    public MedicalServiceViewDto update(Long id, MedicalServiceUpdateDto dto) {
        MedicalService existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Service not found with id: " + id));
        
        MedicalCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Medical Category not found with id: " + dto.getCategoryId()));
        
        MedicalServiceMapper.updateEntity(existing, dto, category);
        MedicalService updated = repo.save(existing);
        return MedicalServiceMapper.toViewDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Medical Service not found with id: " + id);
        }
        repo.deleteById(id);
    }

    public long count() {
        return repo.count();
    }

    public List<MedicalServiceViewDto> search(String query) {
        return repo.search(query).stream()
                .map(MedicalServiceMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public List<MedicalService> findAll() {
        return repo.findAll();
    }
}
