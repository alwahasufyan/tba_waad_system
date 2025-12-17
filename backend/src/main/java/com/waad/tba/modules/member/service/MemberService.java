package com.waad.tba.modules.member.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import com.waad.tba.modules.insurance.repository.InsuranceCompanyRepository;
import com.waad.tba.modules.member.dto.FamilyMemberDto;
import com.waad.tba.modules.member.dto.MemberCreateDto;
import com.waad.tba.modules.member.dto.MemberSelectorDto;
import com.waad.tba.modules.member.dto.MemberUpdateDto;
import com.waad.tba.modules.member.dto.MemberViewDto;
import com.waad.tba.modules.member.entity.FamilyMember;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.mapper.MemberMapperV2;
import com.waad.tba.modules.member.repository.FamilyMemberRepository;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.security.AuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final FamilyMemberRepository familyRepo;
    private final MemberMapperV2 mapper;

    private final EmployerRepository employerRepo;
    private final InsuranceCompanyRepository insuranceRepo;
    private final AuthorizationService authorizationService;

    /**
     * Get member selector options with data-level filtering.
     * 
     * FILTERING:
     * - SUPER_ADMIN: All members
     * - INSURANCE_ADMIN: All members
     * - EMPLOYER_ADMIN: Only members from their employer
     */
    public List<MemberSelectorDto> getSelectorOptions() {
        log.debug("📋 Getting member selector options with filtering");
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            log.warn("⚠️ No authenticated user found");
            return Collections.emptyList();
        }
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        List<Member> members;
        
        if (employerFilter != null) {
            log.debug("🔒 Filtering members by employerId={}", employerFilter);
            members = memberRepository.findByEmployerId(employerFilter);
        } else {
            log.debug("🔓 No filter - returning all members");
            members = memberRepository.findAll();
        }
        
        return members.stream()
                .map(mapper::toSelectorDto)
                .collect(Collectors.toList());
    }

    public long count() {
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            return 0;
        }
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        if (employerFilter != null) {
            return memberRepository.countByEmployerId(employerFilter);
        }
        
        return memberRepository.count();
    }

    public List<MemberViewDto> search(String query) {
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            return Collections.emptyList();
        }
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        List<Member> members;
        
        if (employerFilter != null) {
            // Search within employer's members only
            members = memberRepository.searchByEmployerId(query, employerFilter);
        } else {
            // Search all members
            members = memberRepository.search(query);
        }
        
        return members.stream()
                .map(member -> {
                    List<FamilyMember> family = familyRepo.findByMemberId(member.getId());
                    return mapper.toViewDto(member, family);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MemberViewDto createMember(MemberCreateDto dto) {

        Employer employer = employerRepo.findById(dto.getEmployerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id: " + dto.getEmployerId()));

        InsuranceCompany insuranceCompany = null;
        if (dto.getInsuranceCompanyId() != null) {
            insuranceCompany = insuranceRepo.findById(dto.getInsuranceCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Insurance company not found"));
        }

        Member member = mapper.toEntity(dto);
        member.setEmployer(employer);
        member.setInsuranceCompany(insuranceCompany);

        Member savedMember = memberRepository.save(member);

        List<FamilyMember> family = dto.getFamilyMembers() != null
                ? dto.getFamilyMembers().stream()
                        .map(mapper::toFamilyMemberEntity)
                        .peek(f -> f.setMember(savedMember))
                        .collect(Collectors.toList())
                : List.of();

        if (!family.isEmpty()) {
            familyRepo.saveAll(family);
        }

        return mapper.toViewDto(savedMember, family);
    }

    @Transactional
    public MemberViewDto updateMember(Long id, MemberUpdateDto dto) {

        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));

        mapper.updateEntityFromDto(member, dto);

        if (dto.getInsuranceCompanyId() != null) {
            InsuranceCompany insuranceCompany = insuranceRepo.findById(dto.getInsuranceCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Insurance company not found"));
            member.setInsuranceCompany(insuranceCompany);
        }

        memberRepository.save(member);

        List<FamilyMember> existing = familyRepo.findByMemberId(member.getId());

        List<Long> incomingIds = dto.getFamilyMembers() != null
                ? dto.getFamilyMembers().stream()
                        .map(FamilyMemberDto::getId)
                        .filter(f -> f != null)
                        .collect(Collectors.toList())
                : List.of();

        for (FamilyMember fm : existing) {
            if (!incomingIds.contains(fm.getId())) {
                familyRepo.delete(fm);
            }
        }

        if (dto.getFamilyMembers() != null) {
            for (FamilyMemberDto fmd : dto.getFamilyMembers()) {
                FamilyMember fm;

                if (fmd.getId() != null) {
                    fm = existing.stream()
                            .filter(e -> e.getId().equals(fmd.getId()))
                            .findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Family member not found: " + fmd.getId()));
                } else {
                    fm = new FamilyMember();
                    fm.setMember(member);
                }

                FamilyMember newEntity = mapper.toFamilyMemberEntity(fmd);
                newEntity.setId(fm.getId());
                newEntity.setMember(member);

                familyRepo.save(newEntity);
            }
        }

        List<FamilyMember> updatedFamily = familyRepo.findByMemberId(member.getId());

        return mapper.toViewDto(member, updatedFamily);
    }

    @Transactional(readOnly = true)
    public MemberViewDto getMember(Long id) {
        log.debug("📋 Getting member by id: {}", id);
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            throw new ResourceNotFoundException("Authentication required");
        }
        
        // Check access authorization
        if (!authorizationService.canAccessMember(currentUser, id)) {
            log.warn("❌ Access denied: user {} attempted to access member {}", 
                currentUser.getUsername(), id);
            throw new ResourceNotFoundException("Member not found: " + id);
        }

        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));

        List<FamilyMember> family = familyRepo.findByMemberId(member.getId());

        return mapper.toViewDto(member, family);
    }

    @Transactional(readOnly = true)
    public Page<MemberViewDto> listMembers(Pageable pageable, String search) {
        log.debug("📋 Listing members with pagination. search={}", search);
        
        User currentUser = authorizationService.getCurrentUser();
        if (currentUser == null) {
            return Page.empty(pageable);
        }
        
        Long employerFilter = authorizationService.getEmployerFilterForUser(currentUser);
        Page<Member> memberPage;
        
        if (employerFilter != null) {
            // Filter by employer
            log.debug("🔒 Filtering members by employerId={}", employerFilter);
            if (search != null && !search.isBlank()) {
                memberPage = memberRepository.searchPagedByEmployerId(search, employerFilter, pageable);
            } else {
                memberPage = memberRepository.findByEmployerId(employerFilter, pageable);
            }
        } else {
            // No filter - return all
            log.debug("🔓 No filter - returning all members");
            if (search != null && !search.isBlank()) {
                memberPage = memberRepository.searchPaged(search, pageable);
            } else {
                memberPage = memberRepository.findAll(pageable);
            }
        }
        
        return memberPage.map(member -> {
            List<FamilyMember> family = familyRepo.findByMemberId(member.getId());
            return mapper.toViewDto(member, family);
        });
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        member.setActive(false);
        memberRepository.save(member);
    }
}
