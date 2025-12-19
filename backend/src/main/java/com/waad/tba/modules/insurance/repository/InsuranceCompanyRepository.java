package com.waad.tba.modules.insurance.repository;

import com.waad.tba.modules.insurance.entity.InsuranceCompany;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * LEGACY REPOSITORY - READ ONLY
 * 
 * @deprecated Use {@link com.waad.tba.common.repository.OrganizationRepository} instead.
 *             This repository is kept for backward compatibility ONLY.
 *             DO NOT use save(), saveAll(), delete(), or any write operations.
 *             All writes must go through OrganizationRepository with type=INSURANCE.
 */
@Deprecated
@Repository
public interface InsuranceCompanyRepository extends JpaRepository<InsuranceCompany, Long> {
    
    Optional<InsuranceCompany> findByEmail(String email);
    
    Optional<InsuranceCompany> findByName(String name);
    
    @Query("SELECT i FROM InsuranceCompany i WHERE " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.phone) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<InsuranceCompany> searchInsuranceCompanies(@Param("search") String search);

    @Query("SELECT i FROM InsuranceCompany i WHERE " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.phone) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.address) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<InsuranceCompany> searchPaged(@Param("q") String q, Pageable pageable);
}
