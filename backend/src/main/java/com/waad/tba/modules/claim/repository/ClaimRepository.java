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

    @Query("SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.member m " +
           "WHERE c.active = true " +
           "AND (LOWER(c.providerName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.diagnosis) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Claim> search(@Param("query") String query);

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
}
