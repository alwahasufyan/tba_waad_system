package com.waad.tba.common.repository;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.enums.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Canonical repository for all organization types (TPA, EMPLOYER, INSURANCE, REVIEWER).
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    List<Organization> findByTypeAndActiveTrue(OrganizationType type);
    
    List<Organization> findByType(OrganizationType type);
    
    Optional<Organization> findByCodeAndType(String code, OrganizationType type);
    
    Optional<Organization> findByCode(String code);
    
    @Query("SELECT o FROM Organization o WHERE o.type = :type AND o.active = true AND " +
           "(LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.nameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Organization> searchByType(@Param("search") String search, @Param("type") OrganizationType type);
    
    @Query("SELECT o FROM Organization o WHERE o.type = :type AND " +
           "(LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.nameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Organization> searchPagedByType(@Param("search") String search, 
                                         @Param("type") OrganizationType type, 
                                         Pageable pageable);
    
    Page<Organization> findByTypeAndActiveTrue(OrganizationType type, Pageable pageable);
    
    long countByType(OrganizationType type);
    
    long countByTypeAndActiveTrue(OrganizationType type);
}
