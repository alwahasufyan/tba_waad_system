package com.waad.tba.modules.member.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.modules.member.entity.FamilyMember;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.repository.FamilyMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FamilyMemberService {

    private static final Logger log = LoggerFactory.getLogger(FamilyMemberService.class);
    private final FamilyMemberRepository familyMemberRepository;

    /**
     * Find all family members for a specific member
     */
    @Transactional(readOnly = true)
    public List<FamilyMember> findByMemberId(Long memberId) {
        log.debug("Finding family members for member ID: {}", memberId);
        return familyMemberRepository.findByMemberId(memberId);
    }

    /**
     * Find all active family members for a specific member
     */
    @Transactional(readOnly = true)
    public List<FamilyMember> findActiveFamilyMembers(Long memberId) {
        log.debug("Finding active family members for member ID: {}", memberId);
        return familyMemberRepository.findByMemberIdAndActiveTrue(memberId);
    }

    /**
     * Find family member by ID
     */
    @Transactional(readOnly = true)
    public FamilyMember findById(Long id) {
        log.debug("Finding family member by ID: {}", id);
        return familyMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + id));
    }

    /**
     * Create a family member
     */
    @Transactional
    public FamilyMember create(FamilyMember familyMember) {
        log.info("Creating family member: {} for member ID: {}", 
                 familyMember.getFullNameArabic(), familyMember.getMember().getId());
        
        familyMember.setCreatedAt(LocalDateTime.now());
        familyMember.setUpdatedAt(LocalDateTime.now());
        
        return familyMemberRepository.save(familyMember);
    }

    /**
     * Update a family member
     */
    @Transactional
    public FamilyMember update(Long id, FamilyMember updatedFamilyMember) {
        log.info("Updating family member ID: {}", id);
        
        FamilyMember existing = findById(id);
        
        existing.setRelationship(updatedFamilyMember.getRelationship());
        existing.setFullNameArabic(updatedFamilyMember.getFullNameArabic());
        existing.setFullNameEnglish(updatedFamilyMember.getFullNameEnglish());
        existing.setCivilId(updatedFamilyMember.getCivilId());
        existing.setBirthDate(updatedFamilyMember.getBirthDate());
        existing.setGender(updatedFamilyMember.getGender());
        existing.setStatus(updatedFamilyMember.getStatus());
        existing.setCardNumber(updatedFamilyMember.getCardNumber());
        existing.setPhone(updatedFamilyMember.getPhone());
        existing.setNotes(updatedFamilyMember.getNotes());
        existing.setActive(updatedFamilyMember.getActive());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return familyMemberRepository.save(existing);
    }

    /**
     * Delete a family member
     */
    @Transactional
    public void delete(Long id) {
        log.info("Deleting family member ID: {}", id);
        
        FamilyMember familyMember = findById(id);
        familyMemberRepository.delete(familyMember);
    }

    /**
     * Delete all family members for a specific member
     */
    @Transactional
    public void deleteByMemberId(Long memberId) {
        log.info("Deleting all family members for member ID: {}", memberId);
        familyMemberRepository.deleteByMemberId(memberId);
    }

    /**
     * Save list of family members for a member
     */
    @Transactional
    public List<FamilyMember> saveAll(Member member, List<FamilyMember> familyMembers) {
        log.info("Saving {} family members for member ID: {}", familyMembers.size(), member.getId());
        
        familyMembers.forEach(fm -> {
            fm.setMember(member);
            fm.setCreatedAt(LocalDateTime.now());
            fm.setUpdatedAt(LocalDateTime.now());
        });
        
        return familyMemberRepository.saveAll(familyMembers);
    }

    /**
     * Count family members for a member
     */
    @Transactional(readOnly = true)
    public long countByMemberId(Long memberId) {
        return familyMemberRepository.countByMemberId(memberId);
    }

    /**
     * Check if civil ID exists
     */
    @Transactional(readOnly = true)
    public boolean existsByCivilId(String civilId) {
        return familyMemberRepository.existsByCivilId(civilId);
    }
}
