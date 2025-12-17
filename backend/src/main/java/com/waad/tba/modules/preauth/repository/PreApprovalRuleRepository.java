package com.waad.tba.modules.preauth.repository;

import com.waad.tba.modules.preauth.entity.PreApprovalRule;
import com.waad.tba.modules.provider.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreApprovalRuleRepository extends JpaRepository<PreApprovalRule, Long> {
    
    List<PreApprovalRule> findByActiveTrue();
    
    List<PreApprovalRule> findByActiveTrueOrderByPriorityDesc();
    
    List<PreApprovalRule> findByChronicOnlyTrue();
    
    List<PreApprovalRule> findByServiceCode(String serviceCode);
    
    List<PreApprovalRule> findByProviderType(Provider.ProviderType providerType);
    
    List<PreApprovalRule> findByCategory(String category);
    
    @Query("SELECT r FROM PreApprovalRule r " +
           "WHERE r.active = true " +
           "AND r.chronicCondition.id = :conditionId " +
           "ORDER BY r.priority DESC")
    List<PreApprovalRule> findByChronicCondition(@Param("conditionId") Long conditionId);
    
    @Query("SELECT r FROM PreApprovalRule r " +
           "WHERE r.active = true " +
           "AND (r.serviceCode = :serviceCode OR r.serviceCode IS NULL) " +
           "AND (r.providerType = :providerType OR r.providerType IS NULL) " +
           "ORDER BY r.priority DESC")
    List<PreApprovalRule> findMatchingRules(
        @Param("serviceCode") String serviceCode,
        @Param("providerType") Provider.ProviderType providerType
    );
}
