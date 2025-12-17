package com.waad.tba.modules.company.repository;

import com.waad.tba.modules.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Company entity
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    Optional<Company> findByCode(String code);
    
    boolean existsByCode(String code);
}
