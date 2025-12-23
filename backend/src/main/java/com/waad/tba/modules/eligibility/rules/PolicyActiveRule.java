package com.waad.tba.modules.eligibility.rules;

import com.waad.tba.modules.eligibility.domain.EligibilityContext;
import com.waad.tba.modules.eligibility.domain.EligibilityReason;
import com.waad.tba.modules.eligibility.domain.EligibilityRule;
import com.waad.tba.modules.eligibility.domain.RuleResult;
import com.waad.tba.modules.policy.entity.Policy;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Rule: Policy Active
 * Phase E1 - Eligibility Engine
 * 
 * Validates that the policy has an ACTIVE status.
 * This is a hard rule - failure stops evaluation.
 * 
 * Priority: 40
 * 
 * @author TBA WAAD System
 * @version 2025.1
 */
@Component
@Order(40)
public class PolicyActiveRule implements EligibilityRule {

    @Override
    public String getRuleCode() {
        return "POLICY_ACTIVE";
    }

    @Override
    public String getNameAr() {
        return "التحقق من حالة الوثيقة";
    }

    @Override
    public int getPriority() {
        return 40;
    }

    @Override
    public boolean isHardRule() {
        return true;
    }

    @Override
    public boolean isApplicable(EligibilityContext context) {
        return context.hasPolicy();
    }

    @Override
    public RuleResult evaluate(EligibilityContext context) {
        Policy policy = context.getPolicy();
        Policy.PolicyStatus status = policy.getStatus();

        // Also check the active flag
        if (!Boolean.TRUE.equals(policy.getActive())) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "Policy: " + policy.getPolicyNumber()
            );
        }

        if (status == null) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "Policy status is null"
            );
        }

        switch (status) {
            case ACTIVE:
            case RENEWAL_PENDING:  // Still considered valid
                return RuleResult.pass();
            
            case SUSPENDED:
                return RuleResult.fail(
                    EligibilityReason.POLICY_SUSPENDED,
                    "Policy: " + policy.getPolicyNumber()
                );
            
            case EXPIRED:
                return RuleResult.fail(
                    EligibilityReason.POLICY_EXPIRED,
                    "Policy: " + policy.getPolicyNumber()
                );
            
            case CANCELLED:
                return RuleResult.fail(
                    EligibilityReason.POLICY_CANCELLED,
                    "Policy: " + policy.getPolicyNumber()
                );
            
            case PENDING:
            default:
                return RuleResult.fail(
                    EligibilityReason.POLICY_INACTIVE,
                    "Policy status: " + status
                );
        }
    }
}
