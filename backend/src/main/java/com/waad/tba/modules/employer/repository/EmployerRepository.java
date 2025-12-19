package com.waad.tba.modules.employer.repository;

import com.waad.tba.common.entity.Organization;
import com.waad.tba.common.enums.OrganizationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployerRepository extends JpaRepository<Organization, Long> {

    List<Organization> findByTypeAndActiveTrue(OrganizationType type);
}
