package com.waad.tba.modules.insurancepolicy.repository;

import com.waad.tba.modules.insurancepolicy.entity.PolicyBenefitPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyBenefitPackageRepository extends JpaRepository<PolicyBenefitPackage, Long> {

    Optional<PolicyBenefitPackage> findByCode(String code);

    @Query("SELECT b FROM PolicyBenefitPackage b WHERE b.insurancePolicy.id = :policyId")
    List<PolicyBenefitPackage> findByInsurancePolicyId(@Param("policyId") Long policyId);
}
