package com.waad.tba.modules.preauth.repository;

import com.waad.tba.modules.preauth.entity.MemberChronicCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberChronicConditionRepository extends JpaRepository<MemberChronicCondition, Long> {
    
    List<MemberChronicCondition> findByMemberId(Long memberId);
    
    List<MemberChronicCondition> findByMemberIdAndActiveTrue(Long memberId);
    
    @Query("SELECT mcc FROM MemberChronicCondition mcc " +
           "WHERE mcc.member.id = :memberId " +
           "AND mcc.active = true " +
           "AND (mcc.validFrom IS NULL OR mcc.validFrom <= :date) " +
           "AND (mcc.validUntil IS NULL OR mcc.validUntil >= :date)")
    List<MemberChronicCondition> findActiveConditionsForMember(
        @Param("memberId") Long memberId, 
        @Param("date") LocalDate date
    );
    
    @Query("SELECT mcc FROM MemberChronicCondition mcc " +
           "WHERE mcc.member.id = :memberId " +
           "AND mcc.chronicCondition.id = :conditionId " +
           "AND mcc.active = true")
    Optional<MemberChronicCondition> findByMemberAndCondition(
        @Param("memberId") Long memberId, 
        @Param("conditionId") Long conditionId
    );
    
    @Query("SELECT COUNT(mcc) > 0 FROM MemberChronicCondition mcc " +
           "WHERE mcc.member.id = :memberId " +
           "AND mcc.active = true " +
           "AND (mcc.validFrom IS NULL OR mcc.validFrom <= CURRENT_DATE) " +
           "AND (mcc.validUntil IS NULL OR mcc.validUntil >= CURRENT_DATE)")
    boolean hasActiveChronicCondition(@Param("memberId") Long memberId);
    
    List<MemberChronicCondition> findByChronicConditionId(Long conditionId);
}
