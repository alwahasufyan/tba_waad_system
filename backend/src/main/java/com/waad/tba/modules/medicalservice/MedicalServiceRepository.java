package com.waad.tba.modules.medicalservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalServiceRepository extends JpaRepository<MedicalService, Long> {
    
    @Query("SELECT ms FROM MedicalService ms WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(ms.nameAr) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ms.nameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ms.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MedicalService> findAllWithSearch(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT ms FROM MedicalService ms WHERE " +
           "LOWER(ms.nameAr) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(ms.nameEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(ms.code) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MedicalService> search(@Param("query") String query);
}
