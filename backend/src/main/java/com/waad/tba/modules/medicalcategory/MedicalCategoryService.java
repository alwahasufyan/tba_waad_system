package com.waad.tba.modules.medicalcategory;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategoryCreateDto;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategorySelectorDto;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategoryUpdateDto;
import com.waad.tba.modules.medicalcategory.dto.MedicalCategoryViewDto;
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
public class MedicalCategoryService {

    private final MedicalCategoryRepository repository;

    public List<MedicalCategorySelectorDto> getSelectorOptions() {
        return repository.findAll().stream()
                .map(MedicalCategoryMapper::toSelectorDto)
                .collect(Collectors.toList());
    }

    public Page<MedicalCategoryViewDto> findAllPaginated(Pageable pageable, String search) {
        Page<MedicalCategory> page = repository.findAllWithSearch(search, pageable);
        return page.map(MedicalCategoryMapper::toViewDto);
    }

    public MedicalCategoryViewDto findById(Long id) {
        MedicalCategory entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Category not found with id: " + id));
        return MedicalCategoryMapper.toViewDto(entity);
    }

    public MedicalCategoryViewDto findByCode(String code) {
        MedicalCategory entity = repository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Category not found with code: " + code));
        return MedicalCategoryMapper.toViewDto(entity);
    }

    @Transactional
    public MedicalCategoryViewDto create(MedicalCategoryCreateDto dto) {
        if (repository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Medical category with code " + dto.getCode() + " already exists");
        }
        
        MedicalCategory entity = MedicalCategoryMapper.toEntity(dto);
        MedicalCategory saved = repository.save(entity);
        return MedicalCategoryMapper.toViewDto(saved);
    }

    @Transactional
    public MedicalCategoryViewDto update(Long id, MedicalCategoryUpdateDto dto) {
        MedicalCategory existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Category not found with id: " + id));
        
        MedicalCategoryMapper.updateEntity(existing, dto);
        MedicalCategory updated = repository.save(existing);
        return MedicalCategoryMapper.toViewDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        MedicalCategory category = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Category not found with id: " + id));
        
        if (!category.getMedicalServices().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with associated medical services. " +
                    "Please reassign or delete the services first.");
        }
        
        repository.deleteById(id);
    }

    public long count() {
        return repository.count();
    }

    public List<MedicalCategoryViewDto> search(String query) {
        return repository.search(query).stream()
                .map(MedicalCategoryMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public List<MedicalCategory> findAll() {
        return repository.findAll();
    }
}
