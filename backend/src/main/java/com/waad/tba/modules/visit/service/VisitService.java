package com.waad.tba.modules.visit.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.systemadmin.service.AuditLogService;
import com.waad.tba.modules.visit.dto.VisitCreateDto;
import com.waad.tba.modules.visit.dto.VisitResponseDto;
import com.waad.tba.modules.visit.entity.Visit;
import com.waad.tba.modules.visit.mapper.VisitMapper;
import com.waad.tba.modules.visit.repository.VisitRepository;
import com.waad.tba.security.AuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository repository;
    private final MemberRepository memberRepository;
    private final VisitMapper mapper;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<VisitResponseDto> findAll() {
        log.debug("Finding all visits with data-level filtering");
        
        // Get current user and apply role-based filtering
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("No authenticated user found when accessing visits list");
            return Collections.emptyList();
        }
        
        List<Visit> visits;
        
        // Apply data-level security based on user role
        if (authorizationService.isSuperAdmin(currentUser)) {
            // SUPER_ADMIN: Access to all visits
            log.debug("SUPER_ADMIN access: returning all visits");
            visits = repository.findAll();
            
        } else if (authorizationService.isInsuranceAdmin(currentUser)) {
            // INSURANCE_ADMIN: Filter by insurance company
            Long companyFilter = authorizationService.getCompanyFilterForUser(currentUser);
            if (companyFilter != null) {
                log.info("Applying insurance company filter for visits: companyId={} for user {}", 
                    companyFilter, currentUser.getUsername());
                // Get visits for members belonging to this insurance company
                visits = repository.findByMemberInsuranceCompanyId(companyFilter);
            } else {
                log.debug("INSURANCE_ADMIN access: returning all visits (no company filter)");
                visits = repository.findAll();
            }
            
        } else if (authorizationService.isEmployerAdmin(currentUser)) {
            // EMPLOYER_ADMIN: Check feature toggle first (Phase 9)
            if (!authorizationService.canEmployerViewVisits(currentUser)) {
                log.warn("FeatureCheck: EMPLOYER_ADMIN user {} attempted to view visits but feature VIEW_VISITS is disabled", 
                    currentUser.getUsername());
                return Collections.emptyList();
            }
            
            // Feature enabled: Filter by employer
            Long employerId = authorizationService.getEmployerFilterForUser(currentUser);
            if (employerId == null) {
                log.warn("EMPLOYER_ADMIN user {} has no employerId assigned", currentUser.getUsername());
                return Collections.emptyList();
            }
            
            log.info("Applying employer filter for visits: employerId={} for user {}", 
                employerId, currentUser.getUsername());
            visits = repository.findByMemberEmployerId(employerId);
            
        } else {
            // REVIEWER, PROVIDER, USER: No access to visits list
            log.warn("Access denied: user {} with roles {} attempted to access visits list", 
                currentUser.getUsername(), 
                currentUser.getRoles().stream()
                    .map(r -> r.getName())
                    .collect(Collectors.joining(", ")));
            return Collections.emptyList();
        }
        
        return visits.stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VisitResponseDto findById(Long id) {
        log.debug("Finding visit by id: {}", id);
        
        // Get current user and validate access
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("No authenticated user found when accessing visit: {}", id);
            throw new AccessDeniedException("Authentication required");
        }
        
        // Phase 9: Check feature toggle for EMPLOYER_ADMIN
        if (authorizationService.isEmployerAdmin(currentUser)) {
            if (!authorizationService.canEmployerViewVisits(currentUser)) {
                log.warn("FeatureCheck: EMPLOYER_ADMIN user {} attempted to view visit {} but feature VIEW_VISITS is disabled", 
                    currentUser.getUsername(), id);
                throw new AccessDeniedException("Your employer account does not have permission to view visits");
            }
        }
        
        // Check if user can access this visit
        if (!authorizationService.canAccessVisit(currentUser, id)) {
            log.warn("Access denied: user {} attempted to view visit {}", 
                currentUser.getUsername(), id);
            throw new AccessDeniedException("Access denied to this visit");
        }
        
        Visit entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit", "id", id));
        
        // Audit log: Visit viewed
        auditLogService.createAuditLog("VIEW", "VISIT", id, 
            "Visit viewed by " + currentUser.getUsername(),
            currentUser.getId(), currentUser.getUsername(), null, null);
        
        log.debug("Visit {} accessed successfully by user {}", id, currentUser.getUsername());
        return mapper.toResponseDto(entity);
    }

    @Transactional
    public VisitResponseDto create(VisitCreateDto dto) {
        log.info("Creating new visit for member id: {}", dto.getMemberId());

        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", dto.getMemberId()));

        Visit entity = mapper.toEntity(dto, member);
        Visit saved = repository.save(entity);
        
        log.info("Visit created successfully with id: {}", saved.getId());
        return mapper.toResponseDto(saved);
    }

    @Transactional
    public VisitResponseDto update(Long id, VisitCreateDto dto) {
        log.info("Updating visit with id: {}", id);
        
        Visit entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit", "id", id));

        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", dto.getMemberId()));

        mapper.updateEntityFromDto(entity, dto, member);
        Visit updated = repository.save(entity);
        
        log.info("Visit updated successfully: {}", id);
        return mapper.toResponseDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting visit with id: {}", id);
        
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Visit", "id", id);
        }
        
        repository.deleteById(id);
        log.info("Visit deleted successfully: {}", id);
    }

    @Transactional(readOnly = true)
    public List<VisitResponseDto> search(String query) {
        log.debug("Searching visits with query: {}", query);
        return repository.search(query).stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<VisitResponseDto> findAllPaginated(Pageable pageable, String search) {
        log.debug("Finding visits with pagination. search={}", search);
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
