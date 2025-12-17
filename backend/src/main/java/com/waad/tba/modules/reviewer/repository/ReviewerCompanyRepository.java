package com.waad.tba.modules.reviewer.repository;

import com.waad.tba.modules.reviewer.entity.ReviewerCompany;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewerCompanyRepository extends JpaRepository<ReviewerCompany, Long> {
    
    @Query("SELECT r FROM ReviewerCompany r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.medicalDirector) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ReviewerCompany> search(String query);

    @Query("SELECT r FROM ReviewerCompany r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(r.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(r.phone) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<ReviewerCompany> searchPaged(@Param("q") String q, Pageable pageable);
}
