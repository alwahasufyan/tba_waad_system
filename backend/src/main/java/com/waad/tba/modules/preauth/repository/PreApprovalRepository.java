package com.waad.tba.modules.preauth.repository;

import com.waad.tba.modules.preauth.entity.PreApproval;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PreApprovalRepository extends JpaRepository<PreApproval, Long> {
    
    Optional<PreApproval> findByApprovalNumber(String approvalNumber);
    
    List<PreApproval> findByMemberId(Long memberId);
    
    List<PreApproval> findByMemberIdAndStatus(Long memberId, PreApproval.ApprovalStatus status);
    
    List<PreApproval> findByProviderId(Long providerId);
    
    List<PreApproval> findByCompanyId(Long companyId);
    
    Page<PreApproval> findByCompanyId(Long companyId, Pageable pageable);
    
    List<PreApproval> findByStatus(PreApproval.ApprovalStatus status);
    
    List<PreApproval> findByType(PreApproval.ApprovalType type);
    
    @Query("SELECT pa FROM PreApproval pa " +
           "WHERE pa.member.id = :memberId " +
           "AND pa.status = 'APPROVED' " +
           "AND pa.expired = false " +
           "AND pa.active = true " +
           "AND (pa.validFrom IS NULL OR pa.validFrom <= :date) " +
           "AND (pa.validUntil IS NULL OR pa.validUntil >= :date)")
    List<PreApproval> findValidApprovalsForMember(
        @Param("memberId") Long memberId, 
        @Param("date") LocalDate date
    );
    
    @Query("SELECT pa FROM PreApproval pa " +
           "WHERE pa.companyId = :companyId " +
           "AND pa.status IN :statuses")
    Page<PreApproval> findByCompanyAndStatuses(
        @Param("companyId") Long companyId,
        @Param("statuses") List<PreApproval.ApprovalStatus> statuses,
        Pageable pageable
    );
    
    @Query("SELECT pa FROM PreApproval pa " +
           "WHERE pa.status = 'APPROVED' " +
           "AND pa.expired = false " +
           "AND pa.validUntil < :date")
    List<PreApproval> findExpiredApprovals(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(pa) FROM PreApproval pa " +
           "WHERE pa.member.id = :memberId " +
           "AND pa.type = :type " +
           "AND pa.requestDate >= :fromDate")
    long countByMemberAndTypeAndDateAfter(
        @Param("memberId") Long memberId,
        @Param("type") PreApproval.ApprovalType type,
        @Param("fromDate") LocalDate fromDate
    );
    
    boolean existsByApprovalNumber(String approvalNumber);
}
