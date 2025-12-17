package com.waad.tba.modules.policy.repository;

import com.waad.tba.modules.policy.entity.BenefitPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BenefitPackageRepository extends JpaRepository<BenefitPackage, Long> {
    
    Optional<BenefitPackage> findByCode(String code);
    
    List<BenefitPackage> findByActive(Boolean active);
    
    boolean existsByCode(String code);
}
