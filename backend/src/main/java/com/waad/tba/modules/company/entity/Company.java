package com.waad.tba.modules.company.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Legacy TPA company entity - READ ONLY.
 * 
 * @deprecated Use {@link com.waad.tba.common.entity.Organization} with type=TPA instead.
 *             This entity is kept for backward compatibility only. All new code must use Organization.
 *             Writing to this entity is prohibited - use Organization with OrganizationType.TPA.
 */
@Deprecated
@Entity
@Table(name = "companies", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code", name = "uk_company_code")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "Company code is required")
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
