package com.waad.tba.modules.member.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.waad.tba.modules.member.entity.FamilyMember;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    /**
     * Find all family members for a specific member
     */
    List<FamilyMember> findByMemberId(Long memberId);

    /**
     * Find all active family members for a specific member
     */
    List<FamilyMember> findByMemberIdAndActiveTrue(Long memberId);

    /**
     * Delete all family members for a specific member
     */
    @Modifying
    @Query("DELETE FROM FamilyMember f WHERE f.member.id = :memberId")
    void deleteByMemberId(Long memberId);

    /**
     * Count family members by member ID
     */
    long countByMemberId(Long memberId);

    /**
     * Check if family member with civil ID exists
     */
    boolean existsByCivilId(String civilId);
}
