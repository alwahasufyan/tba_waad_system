package com.waad.tba.modules.employer.repository;

import com.waad.tba.modules.employer.entity.Employer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * WARNING: This repository still uses legacy Employer entity
 * because Member, Claim, and Policy entities have FK relationships to it.
 * TODO: Migrate to Organization after FK migration is complete.
 */
public interface EmployerRepository extends JpaRepository<Employer, Long> {

    List<Employer> findByActiveTrue();
    
    Optional<Employer> findByCode(String code);
    
    Optional<Employer> findByEmail(String email);
}

