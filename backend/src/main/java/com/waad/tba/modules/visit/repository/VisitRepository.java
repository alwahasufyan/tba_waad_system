package com.waad.tba.modules.visit.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.waad.tba.modules.visit.entity.Visit;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    
    List<Visit> findByMemberId(Long memberId);
    
    // Data-level filtering method for explicit employer filtering
    @Query("SELECT v FROM Visit v WHERE v.member.employer.id = :employerId")
    List<Visit> findByMemberEmployerId(@Param("employerId") Long employerId);
    
    // Paginated employer filtering
    @Query("SELECT v FROM Visit v WHERE v.member.employer.id = :employerId")
    Page<Visit> findByMemberEmployerId(@Param("employerId") Long employerId, Pageable pageable);
    
    // Search with employer filtering
    @Query("SELECT v FROM Visit v LEFT JOIN v.member m WHERE v.member.employer.id = :employerId AND (" +
           "LOWER(v.doctorName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.specialty) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.diagnosis) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Visit> searchPagedByEmployerId(@Param("q") String q, @Param("employerId") Long employerId, Pageable pageable);
    
    // Count by employer
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.member.employer.id = :employerId")
    long countByMemberEmployerId(@Param("employerId") Long employerId);
    
    @Query("SELECT v FROM Visit v LEFT JOIN v.member m WHERE " +
           "LOWER(v.doctorName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.specialty) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.diagnosis) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Visit> search(@Param("query") String query);

    @Query("SELECT v FROM Visit v LEFT JOIN v.member m WHERE " +
           "LOWER(v.doctorName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.specialty) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.diagnosis) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.fullNameEnglish) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.fullNameArabic) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Visit> searchPaged(@Param("q") String q, Pageable pageable);
}
