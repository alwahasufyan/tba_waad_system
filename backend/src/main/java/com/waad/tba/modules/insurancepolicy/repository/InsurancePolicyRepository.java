package com.waad.tba.modules.insurancepolicy.repository;

import com.waad.tba.modules.insurancepolicy.entity.InsurancePolicy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {

    Optional<InsurancePolicy> findByCode(String code);

    @Query("SELECT p FROM InsurancePolicy p LEFT JOIN FETCH p.insuranceCompany WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<InsurancePolicy> searchPaged(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM InsurancePolicy p LEFT JOIN FETCH p.insuranceCompany")
    Page<InsurancePolicy> findAllWithCompany(Pageable pageable);
}
