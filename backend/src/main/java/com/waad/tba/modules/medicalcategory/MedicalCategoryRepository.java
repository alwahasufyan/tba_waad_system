package com.waad.tba.modules.medicalcategory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalCategoryRepository extends JpaRepository<MedicalCategory, Long> {

    Optional<MedicalCategory> findByCode(String code);

    boolean existsByCode(String code);
    
    @Query("SELECT mc FROM MedicalCategory mc WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(mc.nameAr) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(mc.nameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(mc.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MedicalCategory> findAllWithSearch(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT mc FROM MedicalCategory mc WHERE " +
           "LOWER(mc.nameAr) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(mc.nameEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(mc.code) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MedicalCategory> search(@Param("query") String query);
}
