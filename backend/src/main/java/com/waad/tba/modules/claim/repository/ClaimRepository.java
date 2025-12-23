package com.waad.tba.modules.claim.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.waad.tba.modules.claim.entity.Claim;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "LEFT JOIN FETCH c.insuranceCompany ic " +
           "LEFT JOIN FETCH c.insurancePolicy ip " +
           "LEFT JOIN FETCH c.benefitPackage bp " +
           "LEFT JOIN FETCH c.preApproval pa " +
           "WHERE c.active = true " +
           "AND (LOWER(c.providerName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.diagnosis) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(m.civilId) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Claim> searchPaged(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Search claims with pagination filtered by employer ID.
     */
    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "LEFT JOIN FETCH m.employer e " +
           "LEFT JOIN FETCH c.insuranceCompany ic " +
           "LEFT JOIN FETCH c.insurancePolicy ip " +
           "LEFT JOIN FETCH c.benefitPackage bp " +
           "LEFT JOIN FETCH c.preApproval pa " +
           "WHERE c.active = true " +
           "AND m.employer.id = :employerId " +
           "AND (LOWER(c.providerName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.diagnosis) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(m.civilId) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Claim> searchPagedByEmployerId(@Param("keyword") String keyword, @Param("employerId") Long employerId, Pageable pageable);

    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "WHERE c.active = true " +
           "AND (LOWER(c.providerName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.diagnosis) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Claim> search(@Param("query") String query);

    /**
     * Search claims (non-paginated) filtered by employer ID.
     */
    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "WHERE c.active = true " +
           "AND m.employer.id = :employerId " +
           "AND (LOWER(c.providerName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.diagnosis) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Claim> searchByEmployerId(@Param("query") String query, @Param("employerId") Long employerId);

    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member " +
           "LEFT JOIN FETCH c.insuranceCompany " +
           "LEFT JOIN FETCH c.insurancePolicy " +
           "LEFT JOIN FETCH c.benefitPackage " +
           "LEFT JOIN FETCH c.preApproval " +
           "WHERE c.member.id = :memberId AND c.active = true")
    List<Claim> findByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member " +
           "LEFT JOIN FETCH c.insuranceCompany " +
           "LEFT JOIN FETCH c.insurancePolicy " +
           "LEFT JOIN FETCH c.benefitPackage " +
           "LEFT JOIN FETCH c.preApproval " +
           "WHERE c.preApproval.id = :preApprovalId AND c.active = true")
    List<Claim> findByPreApprovalId(@Param("preApprovalId") Long preApprovalId);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.active = true")
    long countActive();

    /**
     * Count claims filtered by employer ID.
     */
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.active = true AND c.member.employer.id = :employerId")
    long countByMemberEmployerId(@Param("employerId") Long employerId);

    /**
     * Find claims by member ID and status list.
     * Used for deductible and out-of-pocket calculations.
     * 
     * @param memberId The member ID
     * @param statuses List of claim statuses to include
     * @return List of matching claims
     */
    @Query("SELECT c FROM Claim c " +
           "WHERE c.member.id = :memberId " +
           "AND c.status IN :statuses " +
           "AND c.active = true")
    List<Claim> findByMemberIdAndStatusIn(@Param("memberId") Long memberId, 
                                          @Param("statuses") List<com.waad.tba.modules.claim.entity.ClaimStatus> statuses);

    // ═══════════════════════════════════════════════════════════════════════════════
    // MVP PHASE: Inbox Queries
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Find claims by status list with pagination (for inbox views).
     */
    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "LEFT JOIN FETCH c.insuranceCompany " +
           "WHERE c.active = true " +
           "AND c.status IN :statuses")
    Page<Claim> findByStatusIn(@Param("statuses") List<com.waad.tba.modules.claim.entity.ClaimStatus> statuses, 
                               Pageable pageable);

    /**
     * Find claims by single status with pagination.
     */
    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "LEFT JOIN FETCH c.insuranceCompany " +
           "WHERE c.active = true " +
           "AND c.status = :status")
    Page<Claim> findByStatus(@Param("status") com.waad.tba.modules.claim.entity.ClaimStatus status, 
                             Pageable pageable);

    /**
     * Count claims by status.
     */
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.active = true AND c.status = :status")
    long countByStatus(@Param("status") com.waad.tba.modules.claim.entity.ClaimStatus status);

    /**
     * Count claims by status list.
     */
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.active = true AND c.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<com.waad.tba.modules.claim.entity.ClaimStatus> statuses);
}
