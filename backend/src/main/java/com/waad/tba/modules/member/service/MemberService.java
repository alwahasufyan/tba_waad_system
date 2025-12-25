package com.waad.tba.modules.member.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.enums.OrganizationType;
import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.common.repository.OrganizationRepository;
import com.waad.tba.common.service.OrganizationContextService;
import com.waad.tba.common.service.OrganizationContextService.OrganizationContext;
import com.waad.tba.modules.benefitpolicy.entity.BenefitPolicy;
import com.waad.tba.modules.benefitpolicy.repository.BenefitPolicyRepository;
import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import com.waad.tba.modules.insurance.repository.InsuranceCompanyRepository;
import com.waad.tba.modules.member.dto.FamilyMemberDto;
import com.waad.tba.modules.member.dto.MemberAttributeDto;
import com.waad.tba.modules.member.dto.MemberCreateDto;
import com.waad.tba.modules.member.dto.MemberSelectorDto;
import com.waad.tba.modules.member.dto.MemberUpdateDto;
import com.waad.tba.modules.member.dto.MemberViewDto;
import com.waad.tba.modules.member.entity.FamilyMember;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.entity.MemberAttribute;
import com.waad.tba.modules.member.mapper.MemberMapperV2;
import com.waad.tba.modules.member.repository.FamilyMemberRepository;
import com.waad.tba.modules.member.repository.MemberAttributeRepository;
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
    private final MemberAttributeRepository attributeRepo;
    private final MemberMapperV2 mapper;

    private final EmployerRepository employerRepo;
    private final InsuranceCompanyRepository insuranceRepo;
    private final BenefitPolicyRepository benefitPolicyRepo;
    private final OrganizationRepository organizationRepo;
    private final AuthorizationService authorizationService;
    private final OrganizationContextService organizationContextService;

    /**
     * Get member selector options with organization context filtering.
     * 
     * ODOO-LIKE BEHAVIOR:
     * - TPA context (employerIdHeader = null): All members
     * - Employer context (employerIdHeader = 123): Only that employer's members
     * - EMPLOYER role: Locked to their own employerId
     * 
     * @param employerIdHeader Organization ID from X-Employer-ID header (null = TPA/show all)
     * @return List of member selector options
     */
    public List<MemberSelectorDto> getSelectorOptions(Long employerIdHeader) {
        log.debug("📋 Getting member selector options with organization context");
        
        OrganizationContext context = organizationContextService.getOrganizationContext(employerIdHeader);
        List<Member> members;
        
        if (context.shouldFilter()) {
            Long employerId = context.getEmployerIdForFiltering();
            log.debug("🔒 Employer context - filtering members by employerId={}", employerId);
            members = memberRepository.findByEmployerOrganizationId(employerId);
        } else {
            log.debug("🔓 TPA context - returning all members");
            members = memberRepository.findAll();
        }
        
        return members.stream()
                .map(mapper::toSelectorDto)
                .collect(Collectors.toList());
    }

    /**
     * Count members with organization context filtering.
     * 
     * @param employerIdHeader Organization ID from X-Employer-ID header (null = TPA/show all)
     * @return Total count of members
     */
    public long count(Long employerIdHeader) {
        OrganizationContext context = organizationContextService.getOrganizationContext(employerIdHeader);
        
        if (context.shouldFilter()) {
            Long employerId = context.getEmployerIdForFiltering();
            log.debug("🔒 Employer context - counting members for employerId={}", employerId);
            return memberRepository.countByEmployerOrganizationId(employerId);
        } else {
            log.debug("🔓 TPA context - counting all members");
            return memberRepository.count();
        }
    }

    /**
     * Search members with organization context filtering.
     * 
     * @param employerIdHeader Organization ID from X-Employer-ID header (null = TPA/show all)
     * @param query Search query string
     * @return List of matching members
     */
    public List<MemberViewDto> search(Long employerIdHeader, String query) {
        OrganizationContext context = organizationContextService.getOrganizationContext(employerIdHeader);
        List<Member> members;
        
        if (context.shouldFilter()) {
            Long employerId = context.getEmployerIdForFiltering();
            log.debug("🔒 Employer context - searching members for employerId={}", employerId);
            members = memberRepository.searchByEmployerOrganizationId(query, employerId);
        } else {
            log.debug("🔓 TPA context - searching all members");
            members = memberRepository.search(query);
        }
        
        return members.stream()
                .map(member -> {
                    List<FamilyMember> family = familyRepo.findByMemberId(member.getId());
                    List<MemberAttribute> attrs = attributeRepo.findByMemberId(member.getId());
                    MemberViewDto viewDto = mapper.toViewDto(member, family);
                    viewDto.setAttributes(mapper.toAttributeDtoList(attrs));
                    return viewDto;
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

        // Auto-assign active BenefitPolicy for employer (if exists)
        autoAssignBenefitPolicy(member, employer);

        Member savedMember = memberRepository.save(member);

        // Save family members
        List<FamilyMember> family = dto.getFamilyMembers() != null
                ? dto.getFamilyMembers().stream()
                        .map(mapper::toFamilyMemberEntity)
                        .peek(f -> f.setMember(savedMember))
                        .collect(Collectors.toList())
                : List.of();

        if (!family.isEmpty()) {
            familyRepo.saveAll(family);
        }

        // Save custom attributes
        if (dto.getAttributes() != null && !dto.getAttributes().isEmpty()) {
            for (MemberAttributeDto attrDto : dto.getAttributes()) {
                if (attrDto.getCode() != null && attrDto.getValue() != null) {
                    MemberAttribute attr = mapper.toAttributeEntity(attrDto);
                    attr.setMember(savedMember);
                    attributeRepo.save(attr);
                }
            }
        }

        List<MemberAttribute> savedAttrs = attributeRepo.findByMemberId(savedMember.getId());
        MemberViewDto viewDto = mapper.toViewDto(savedMember, family);
        viewDto.setAttributes(mapper.toAttributeDtoList(savedAttrs));
        
        return viewDto;
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

        // Handle BenefitPolicy assignment
        if (dto.getBenefitPolicyId() != null) {
            BenefitPolicy benefitPolicy = benefitPolicyRepo.findById(dto.getBenefitPolicyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Benefit Policy not found: " + dto.getBenefitPolicyId()));
            member.setBenefitPolicy(benefitPolicy);
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

        // Handle attributes sync (add new, update existing, delete removed)
        syncMemberAttributes(member, dto.getAttributes());

        List<MemberAttribute> updatedAttrs = attributeRepo.findByMemberId(member.getId());
        MemberViewDto viewDto = mapper.toViewDto(member, updatedFamily);
        viewDto.setAttributes(mapper.toAttributeDtoList(updatedAttrs));
        
        return viewDto;
    }
    
    /**
     * Sync member attributes: add new, update existing, delete removed.
     */
    private void syncMemberAttributes(Member member, List<MemberAttributeDto> incomingAttrs) {
        if (incomingAttrs == null) {
            // Null means don't touch attributes
            return;
        }
        
        List<MemberAttribute> existingAttrs = attributeRepo.findByMemberId(member.getId());
        
        // Get incoming IDs (for existing attributes being updated)
        List<Long> incomingIds = incomingAttrs.stream()
                .map(MemberAttributeDto::getId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        
        // Delete attributes not in incoming list
        for (MemberAttribute attr : existingAttrs) {
            if (!incomingIds.contains(attr.getId())) {
                attributeRepo.delete(attr);
            }
        }
        
        // Add or update attributes
        for (MemberAttributeDto attrDto : incomingAttrs) {
            if (attrDto.getCode() == null || attrDto.getValue() == null) {
                continue; // Skip incomplete attributes
            }
            
            MemberAttribute attr;
            if (attrDto.getId() != null) {
                // Update existing
                attr = existingAttrs.stream()
                        .filter(a -> a.getId().equals(attrDto.getId()))
                        .findFirst()
                        .orElse(null);
                if (attr != null) {
                    attr.setAttributeCode(attrDto.getCode());
                    attr.setAttributeValue(attrDto.getValue());
                    if (attrDto.getSource() != null) {
                        attr.setSource(MemberAttribute.AttributeSource.valueOf(attrDto.getSource()));
                    }
                    attributeRepo.save(attr);
                }
            } else {
                // Add new
                attr = mapper.toAttributeEntity(attrDto);
                attr.setMember(member);
                attributeRepo.save(attr);
            }
        }
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
        List<MemberAttribute> attrs = attributeRepo.findByMemberId(member.getId());

        MemberViewDto viewDto = mapper.toViewDto(member, family);
        viewDto.setAttributes(mapper.toAttributeDtoList(attrs));
        
        return viewDto;
    }

    /**
     * List members with pagination and organization context filtering.
     * 
     * ODOO-LIKE BEHAVIOR:
     * - TPA context: Returns all members across all employers
     * - Employer context: Returns only members from specified employer
     * 
     * @param employerIdHeader Organization ID from X-Employer-ID header (null = TPA/show all)
     * @param pageable Pagination parameters
     * @param search Optional search query
     * @return Paginated list of members
     */
    @Transactional(readOnly = true)
    public Page<MemberViewDto> listMembers(Long employerIdHeader, Pageable pageable, String search) {
        log.debug("📋 Listing members with organization context. search={}", search);
        
        OrganizationContext context = organizationContextService.getOrganizationContext(employerIdHeader);
        Page<Member> memberPage;
        
        if (context.shouldFilter()) {
            Long employerId = context.getEmployerIdForFiltering();
            log.debug("🔒 Employer context - filtering members by employerId={}", employerId);
            if (search != null && !search.isBlank()) {
                memberPage = memberRepository.searchPagedByEmployerOrganizationId(search, employerId, pageable);
            } else {
                memberPage = memberRepository.findByEmployerOrganizationId(employerId, pageable);
            }
        } else {
            log.debug("🔓 TPA context - returning all members");
            if (search != null && !search.isBlank()) {
                memberPage = memberRepository.searchPaged(search, pageable);
            } else {
                memberPage = memberRepository.findAll(pageable);
            }
        }
        
        return memberPage.map(member -> {
            List<FamilyMember> family = familyRepo.findByMemberId(member.getId());
            List<MemberAttribute> attrs = attributeRepo.findByMemberId(member.getId());
            MemberViewDto viewDto = mapper.toViewDto(member, family);
            viewDto.setAttributes(mapper.toAttributeDtoList(attrs));
            return viewDto;
        });
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        member.setActive(false);
        memberRepository.save(member);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BENEFIT POLICY ASSIGNMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Auto-assign the employer's active BenefitPolicy to the member.
     * This ensures all new members are automatically enrolled in their employer's
     * current coverage plan.
     * 
     * @param member The member being created
     * @param employer The member's employer
     */
    private void autoAssignBenefitPolicy(Member member, Employer employer) {
        // Look up the Organization corresponding to this legacy Employer
        Optional<Organization> orgOpt = organizationRepo.findByCodeAndType(
                employer.getCode(), OrganizationType.EMPLOYER);

        if (orgOpt.isEmpty()) {
            log.warn("⚠️ No Organization found for Employer code '{}', cannot auto-assign BenefitPolicy", 
                    employer.getCode());
            return;
        }

        Long employerOrgId = orgOpt.get().getId();
        LocalDate today = LocalDate.now();

        // Find active effective policy for employer
        Optional<BenefitPolicy> activePolicyOpt = benefitPolicyRepo
                .findActiveEffectivePolicyForEmployer(employerOrgId, today);

        if (activePolicyOpt.isPresent()) {
            BenefitPolicy activePolicy = activePolicyOpt.get();
            member.setBenefitPolicy(activePolicy);
            log.info("✅ Auto-assigned BenefitPolicy '{}' (ID={}) to member {}",
                    activePolicy.getName(), activePolicy.getId(), member.getCivilId());
        } else {
            log.info("ℹ️ No active BenefitPolicy found for employer org {}. Member will have no coverage.",
                    employerOrgId);
        }
    }

    /**
     * Manually assign or change a member's BenefitPolicy.
     * Use this when a member needs to be moved to a different policy.
     * 
     * @param memberId The member ID
     * @param benefitPolicyId The new BenefitPolicy ID (null to remove)
     * @return Updated member view
     */
    @Transactional
    public MemberViewDto assignBenefitPolicy(Long memberId, Long benefitPolicyId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));

        if (benefitPolicyId == null) {
            member.setBenefitPolicy(null);
            log.info("🔄 Removed BenefitPolicy from member {}", memberId);
        } else {
            BenefitPolicy policy = benefitPolicyRepo.findById(benefitPolicyId)
                    .orElseThrow(() -> new ResourceNotFoundException("BenefitPolicy not found: " + benefitPolicyId));
            
            member.setBenefitPolicy(policy);
            log.info("🔄 Assigned BenefitPolicy '{}' to member {}", policy.getName(), memberId);
        }

        memberRepository.save(member);
        
        List<FamilyMember> family = familyRepo.findByMemberId(member.getId());
        List<MemberAttribute> attrs = attributeRepo.findByMemberId(member.getId());
        MemberViewDto viewDto = mapper.toViewDto(member, family);
        viewDto.setAttributes(mapper.toAttributeDtoList(attrs));
        
        return viewDto;
    }

    /**
     * Refresh benefit policies for all members of an employer.
     * Use this when an employer's active policy changes.
     * 
     * @param employerOrgId The employer organization ID
     * @return Number of members updated
     */
    @Transactional
    public int refreshBenefitPoliciesForEmployer(Long employerOrgId) {
        LocalDate today = LocalDate.now();
        
        Optional<BenefitPolicy> activePolicyOpt = benefitPolicyRepo
                .findActiveEffectivePolicyForEmployer(employerOrgId, today);

        List<Member> members = memberRepository.findByEmployerOrganizationId(employerOrgId);
        
        BenefitPolicy activePolicy = activePolicyOpt.orElse(null);
        
        for (Member member : members) {
            member.setBenefitPolicy(activePolicy);
        }
        
        memberRepository.saveAll(members);
        
        log.info("🔄 Refreshed BenefitPolicy for {} members of employer org {}. Policy: {}",
                members.size(), employerOrgId, 
                activePolicy != null ? activePolicy.getName() : "NONE");
        
        return members.size();
    }
}
