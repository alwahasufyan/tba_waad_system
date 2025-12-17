package com.waad.tba.modules.policy.repository;

import com.waad.tba.modules.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    
    Optional<Policy> findByPolicyNumber(String policyNumber);
    
    List<Policy> findByEmployerId(Long employerId);
    
    List<Policy> findByInsuranceCompanyId(Long insuranceCompanyId);
    
    List<Policy> findByBenefitPackageId(Long benefitPackageId);
    
    List<Policy> findByStatus(Policy.PolicyStatus status);
    
    @Query("SELECT p FROM Policy p WHERE p.employer.id = :employerId AND p.status = :status")
    List<Policy> findByEmployerIdAndStatus(@Param("employerId") Long employerId, 
                                           @Param("status") Policy.PolicyStatus status);
    
    @Query("SELECT p FROM Policy p WHERE p.startDate <= :date AND p.endDate >= :date AND p.active = true")
    List<Policy> findActivePoliciesOnDate(@Param("date") LocalDate date);
    
    @Query("SELECT p FROM Policy p WHERE p.endDate < :date AND p.status = 'ACTIVE'")
    List<Policy> findExpiredPolicies(@Param("date") LocalDate date);
    
    boolean existsByPolicyNumber(String policyNumber);
}
