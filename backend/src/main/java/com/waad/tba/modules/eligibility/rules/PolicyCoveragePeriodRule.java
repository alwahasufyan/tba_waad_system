package com.waad.tba.modules.eligibility.rules;

import com.waad.tba.modules.eligibility.domain.EligibilityContext;
import com.waad.tba.modules.eligibility.domain.EligibilityReason;
import com.waad.tba.modules.eligibility.domain.EligibilityRule;
import com.waad.tba.modules.eligibility.domain.RuleResult;
import com.waad.tba.modules.policy.entity.Policy;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Rule: Policy Coverage Period
 * Phase E1 - Eligibility Engine
 * 
 * Validates that the service date falls within the policy coverage period.
 * This is a hard rule - failure stops evaluation.
 * 
 * Priority: 50
 * 
 * @author TBA WAAD System
 * @version 2025.1
 */
@Component
@Order(50)
public class PolicyCoveragePeriodRule implements EligibilityRule {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public String getRuleCode() {
        return "POLICY_COVERAGE_PERIOD";
    }

    @Override
    public String getNameAr() {
        return "التحقق من فترة التغطية";
    }

    @Override
    public int getPriority() {
        return 50;
    }

    @Override
    public boolean isHardRule() {
        return true;
    }

    @Override
    public boolean isApplicable(EligibilityContext context) {
        return context.hasPolicy() && context.getServiceDate() != null;
    }

    @Override
    public RuleResult evaluate(EligibilityContext context) {
        Policy policy = context.getPolicy();
        LocalDate serviceDate = context.getServiceDate();
        LocalDate startDate = policy.getStartDate();
        LocalDate endDate = policy.getEndDate();

        // Check start date
        if (startDate == null) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "Policy has no start date defined"
            );
        }

        // Check end date
        if (endDate == null) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "Policy has no end date defined"
            );
        }

        // Service date before coverage start
        if (serviceDate.isBefore(startDate)) {
            return RuleResult.fail(
                EligibilityReason.SERVICE_DATE_BEFORE_COVERAGE,
                String.format(
                    "Service date: %s, Coverage starts: %s",
                    serviceDate.format(DATE_FORMAT),
                    startDate.format(DATE_FORMAT)
                )
            );
        }

        // Service date after coverage end
        if (serviceDate.isAfter(endDate)) {
            return RuleResult.fail(
                EligibilityReason.SERVICE_DATE_AFTER_COVERAGE,
                String.format(
                    "Service date: %s, Coverage ends: %s",
                    serviceDate.format(DATE_FORMAT),
                    endDate.format(DATE_FORMAT)
                )
            );
        }

        return RuleResult.pass(
            String.format("Coverage: %s to %s", startDate.format(DATE_FORMAT), endDate.format(DATE_FORMAT))
        );
    }
}
