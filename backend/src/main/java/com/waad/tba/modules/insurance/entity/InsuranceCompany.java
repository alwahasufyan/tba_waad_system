package com.waad.tba.modules.insurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Legacy insurance company entity - READ ONLY.
 * 
 * @deprecated Use {@link com.waad.tba.common.entity.Organization} with type=INSURANCE instead.
 *             This entity is kept for backward compatibility only. All new code must use Organization.
 *             Writing to this entity is prohibited - use Organization with OrganizationType.INSURANCE.
 */
@Deprecated
@Entity
@Table(name = "insurance_companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class InsuranceCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    private String address;
    
    private String phone;
    
    private String email;
    
    private String contactPerson;

    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
