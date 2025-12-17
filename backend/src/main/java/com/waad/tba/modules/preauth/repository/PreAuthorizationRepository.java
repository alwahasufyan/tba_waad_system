package com.waad.tba.modules.preauth.repository;

import com.waad.tba.modules.preauth.entity.PreAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PreAuthorizationRepository extends JpaRepository<PreAuthorization, Long> {
    
    Optional<PreAuthorization> findByPreAuthNumber(String preAuthNumber);
    
    List<PreAuthorization> findByMemberId(Long memberId);
    
    List<PreAuthorization> findByProviderId(Long providerId);
    
    List<PreAuthorization> findByStatus(PreAuthorization.PreAuthStatus status);
    
    List<PreAuthorization> findByReviewerId(Long reviewerId);
    
    @Query("SELECT p FROM PreAuthorization p WHERE p.member.id = :memberId AND p.status = :status")
    List<PreAuthorization> findByMemberIdAndStatus(@Param("memberId") Long memberId, 
                                                    @Param("status") PreAuthorization.PreAuthStatus status);
    
    @Query("SELECT p FROM PreAuthorization p WHERE p.providerId = :providerId AND p.status = :status")
    List<PreAuthorization> findByProviderIdAndStatus(@Param("providerId") Long providerId, 
                                                      @Param("status") PreAuthorization.PreAuthStatus status);
    
    @Query("SELECT p FROM PreAuthorization p WHERE p.status = 'APPROVED' AND p.approvalExpiryDate < :date")
    List<PreAuthorization> findExpiredApprovals(@Param("date") LocalDate date);
    
    @Query("SELECT p FROM PreAuthorization p WHERE p.requestDate BETWEEN :startDate AND :endDate")
    List<PreAuthorization> findByRequestDateBetween(@Param("startDate") LocalDate startDate, 
                                                     @Param("endDate") LocalDate endDate);
    
    boolean existsByPreAuthNumber(String preAuthNumber);
}
