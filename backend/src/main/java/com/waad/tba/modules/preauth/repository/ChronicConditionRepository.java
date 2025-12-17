package com.waad.tba.modules.preauth.repository;

import com.waad.tba.modules.preauth.entity.ChronicCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChronicConditionRepository extends JpaRepository<ChronicCondition, Long> {
    
    Optional<ChronicCondition> findByCode(String code);
    
    List<ChronicCondition> findByActiveTrue();
    
    List<ChronicCondition> findByRequiresPreApprovalTrue();
    
    List<ChronicCondition> findByCategory(String category);
    
    boolean existsByCode(String code);
}
