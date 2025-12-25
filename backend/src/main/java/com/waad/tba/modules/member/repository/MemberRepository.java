package com.waad.tba.modules.member.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.waad.tba.modules.member.entity.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByCivilId(String civilId);
    
    Optional<Member> findByCardNumber(String cardNumber);
    
    Optional<Member> findByQrCodeValue(String qrCodeValue);
    
    List<Member> findByEmployerId(Long employerId);
    
    Long countByEmployerId(Long employerId);
    
    List<Member> findByPolicyId(Long policyId);
    
    List<Member> findByStatus(Member.MemberStatus status);
    
    @Query("SELECT m FROM Member m WHERE m.employer.id = :employerId AND m.status = :status")
    List<Member> findByEmployerIdAndStatus(@Param("employerId") Long employerId, 
                                           @Param("status") Member.MemberStatus status);
    
    boolean existsByCivilId(String civilId);
    boolean existsByCardNumber(String cardNumber);
    boolean existsByCivilIdAndIdNot(String civilId, Long id);
    boolean existsByCardNumberAndIdNot(String cardNumber, Long id);
    
    Page<Member> findByEmployerId(Long employerId, Pageable pageable);
    
    @Query("SELECT m FROM Member m WHERE m.employer.id = :employerId AND (" +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Member> searchByEmployer(@Param("employerId") Long employerId, @Param("search") String search, Pageable pageable);
    
    /**
     * Search members by employer ID with pagination (alias for searchByEmployer)
     */
    @Query("SELECT m FROM Member m WHERE m.employer.id = :employerId AND (" +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Member> searchPagedByEmployerId(@Param("search") String search, @Param("employerId") Long employerId, Pageable pageable);
    
    /**
     * Search members by employer ID (non-paginated)
     */
    @Query("SELECT m FROM Member m WHERE m.employer.id = :employerId AND (" +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Member> searchByEmployerId(@Param("query") String query, @Param("employerId") Long employerId);
    
    @Query("SELECT m FROM Member m WHERE " +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Member> searchPaged(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT m FROM Member m WHERE " +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Member> search(@Param("query") String query);
    
    @Query("SELECT m FROM Member m WHERE m.insuranceCompany.id = :companyId")
    Page<Member> findByInsuranceCompanyIdPaged(@Param("companyId") Long companyId, Pageable pageable);
    
    @Query("SELECT m FROM Member m WHERE m.insuranceCompany.id = :companyId AND (" +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Member> searchByInsuranceCompany(@Param("companyId") Long companyId, @Param("search") String search, Pageable pageable);

    // ═══════════════════════════════════════════════════════════════════════════
    // ORGANIZATION-BASED QUERIES (Canonical Model)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Find all members by employer organization ID
     */
    List<Member> findByEmployerOrganizationId(Long employerOrgId);

    /**
     * Find all members by employer organization ID (paginated)
     */
    Page<Member> findByEmployerOrganizationId(Long employerOrgId, Pageable pageable);

    /**
     * Count members by employer organization ID
     */
    long countByEmployerOrganizationId(Long employerOrgId);

    /**
     * Search members by employer organization ID (paginated)
     */
    @Query("SELECT m FROM Member m WHERE m.employerOrganization.id = :employerOrgId AND (" +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Member> searchPagedByEmployerOrganizationId(@Param("search") String search, @Param("employerOrgId") Long employerOrgId, Pageable pageable);

    /**
     * Search members by employer organization ID (non-paginated)
     */
    @Query("SELECT m FROM Member m WHERE m.employerOrganization.id = :employerOrgId AND (" +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.civilId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.cardNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Member> searchByEmployerOrganizationId(@Param("query") String query, @Param("employerOrgId") Long employerOrgId);

    /**
     * Find members without a benefit policy for an employer
     */
    @Query("SELECT m FROM Member m WHERE m.employerOrganization.id = :employerOrgId AND m.benefitPolicy IS NULL")
    List<Member> findMembersWithoutBenefitPolicy(@Param("employerOrgId") Long employerOrgId);

    /**
     * Find members by benefit policy ID
     */
    List<Member> findByBenefitPolicyId(Long benefitPolicyId);

    /**
     * Count members by benefit policy ID
     */
    long countByBenefitPolicyId(Long benefitPolicyId);
}
