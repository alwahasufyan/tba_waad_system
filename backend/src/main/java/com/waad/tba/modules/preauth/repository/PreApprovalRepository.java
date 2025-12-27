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
    
    // REMOVED: findByCompanyId methods (Architecture Refactor 2025-12-27)
    // Use findByMemberEmployerOrganizationId() instead if employer filtering is needed
    // Employer context: preApproval.getMember().getEmployerOrganization()
    
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
    
    // REMOVED: findByCompanyAndStatuses (Architecture Refactor 2025-12-27)
    // Use employer-based filtering via member.employerOrganization instead
    
    /**
     * Find pre-approvals by employer organization and statuses.
     * Employer context is derived via Member → Organization(type=EMPLOYER)
     */
    @Query("SELECT pa FROM PreApproval pa " +
           "WHERE pa.member.employerOrganization.id = :employerOrgId " +
           "AND pa.status IN :statuses")
    Page<PreApproval> findByEmployerOrganizationAndStatuses(
        @Param("employerOrgId") Long employerOrgId,
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

    /**
     * Find pending pre-approvals for Operations Inbox
     * Orders by creation date (oldest first - FIFO)
     */
    @Query("SELECT pa FROM PreApproval pa " +
           "WHERE pa.status = 'PENDING' " +
           "AND pa.active = true " +
           "ORDER BY pa.createdAt ASC")
    Page<PreApproval> findPendingPreApprovals(Pageable pageable);

    /**
     * Find pre-approvals by status with pagination
     */
    Page<PreApproval> findByStatus(PreApproval.ApprovalStatus status, Pageable pageable);

    /**
     * Count pending pre-approvals
     */
    @Query("SELECT COUNT(pa) FROM PreApproval pa " +
           "WHERE pa.status = 'PENDING' " +
           "AND pa.active = true")
    long countPending();
}
