package com.waad.tba.modules.provider.repository;

import com.waad.tba.modules.provider.entity.ProviderContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderContractRepository extends JpaRepository<ProviderContract, Long> {

    @Query("SELECT pc FROM ProviderContract pc " +
           "LEFT JOIN FETCH pc.provider p " +
           "WHERE pc.active = true " +
           "AND (LOWER(pc.contractNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.nameArabic) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.nameEnglish) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ProviderContract> searchPaged(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT pc FROM ProviderContract pc " +
           "LEFT JOIN FETCH pc.provider " +
           "WHERE pc.provider.id = :providerId AND pc.active = true")
    List<ProviderContract> findByProviderId(@Param("providerId") Long providerId);

    @Query("SELECT COUNT(pc) FROM ProviderContract pc WHERE pc.active = true")
    long countActive();

    boolean existsByContractNumber(String contractNumber);
}
