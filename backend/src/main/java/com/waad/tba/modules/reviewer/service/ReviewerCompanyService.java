package com.waad.tba.modules.reviewer.service;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.reviewer.dto.ReviewerCompanyCreateDto;
import com.waad.tba.modules.reviewer.dto.ReviewerCompanyResponseDto;
import com.waad.tba.modules.reviewer.dto.ReviewerCompanySelectorDto;
import com.waad.tba.modules.reviewer.entity.ReviewerCompany;
import com.waad.tba.modules.reviewer.mapper.ReviewerCompanyMapper;
import com.waad.tba.modules.reviewer.repository.ReviewerCompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewerCompanyService {

    private final ReviewerCompanyRepository repository;
    private final ReviewerCompanyMapper mapper;

    public List<ReviewerCompanySelectorDto> getSelectorOptions() {
        return repository.findAll().stream()
                .filter(ReviewerCompany::getActive)
                .map(mapper::toSelectorDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewerCompanyResponseDto> findAll() {
        log.debug("Finding all reviewer companies");
        return repository.findAll().stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewerCompanyResponseDto findById(Long id) {
        log.debug("Finding reviewer company by id: {}", id);
        ReviewerCompany entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReviewerCompany", "id", id));
        return mapper.toResponseDto(entity);
    }

    @Transactional
    public ReviewerCompanyResponseDto create(ReviewerCompanyCreateDto dto) {
        log.info("Creating new reviewer company: {}", dto.getName());

        ReviewerCompany entity = mapper.toEntity(dto);
        ReviewerCompany saved = repository.save(entity);
        
        log.info("Reviewer company created successfully with id: {}", saved.getId());
        return mapper.toResponseDto(saved);
    }

    @Transactional
    public ReviewerCompanyResponseDto update(Long id, ReviewerCompanyCreateDto dto) {
        log.info("Updating reviewer company with id: {}", id);
        
        ReviewerCompany entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReviewerCompany", "id", id));

        mapper.updateEntityFromDto(entity, dto);
        ReviewerCompany updated = repository.save(entity);
        
        log.info("Reviewer company updated successfully: {}", id);
        return mapper.toResponseDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting reviewer company with id: {}", id);
        
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("ReviewerCompany", "id", id);
        }
        
        repository.deleteById(id);
        log.info("Reviewer company deleted successfully: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ReviewerCompanyResponseDto> search(String query) {
        log.debug("Searching reviewer companies with query: {}", query);
        return repository.search(query).stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ReviewerCompanyResponseDto> findAllPaginated(Pageable pageable, String search) {
        log.debug("Finding reviewer companies with pagination. search={}", search);
        if (search == null || search.isBlank()) {
            return repository.findAll(pageable).map(mapper::toResponseDto);
        } else {
            return repository.searchPaged(search, pageable).map(mapper::toResponseDto);
        }
    }

    @Transactional(readOnly = true)
    public long count() {
        return repository.count();
    }
}
