package com.waad.tba.modules.eligibility.rules;

import com.waad.tba.modules.benefitpolicy.entity.BenefitPolicy;
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
 * Checks BenefitPolicy first (canonical), then falls back to Policy (legacy).
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
        return context.hasAnyPolicy();
    }

    @Override
    public RuleResult evaluate(EligibilityContext context) {
        // Check BenefitPolicy first (canonical)
        if (context.hasBenefitPolicy()) {
            return evaluateBenefitPolicy(context.getBenefitPolicy());
        }
        
        // Fallback to legacy Policy
        if (context.hasPolicy()) {
            return evaluateLegacyPolicy(context.getPolicy());
        }
        
        return RuleResult.fail(
            EligibilityReason.POLICY_NOT_FOUND,
            "No policy to evaluate"
        );
    }
    
    private RuleResult evaluateBenefitPolicy(BenefitPolicy benefitPolicy) {
        // Check the active flag
        if (!benefitPolicy.isActive()) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "BenefitPolicy: " + benefitPolicy.getName() + " (inactive)"
            );
        }
        
        BenefitPolicy.BenefitPolicyStatus status = benefitPolicy.getStatus();
        if (status == null) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "BenefitPolicy status is null"
            );
        }
        
        switch (status) {
            case ACTIVE:
                return RuleResult.pass("BenefitPolicy ACTIVE: " + benefitPolicy.getName());
            
            case SUSPENDED:
                return RuleResult.fail(
                    EligibilityReason.POLICY_SUSPENDED,
                    "BenefitPolicy: " + benefitPolicy.getName()
                );
            
            case EXPIRED:
                return RuleResult.fail(
                    EligibilityReason.POLICY_EXPIRED,
                    "BenefitPolicy: " + benefitPolicy.getName()
                );
            
            case CANCELLED:
                return RuleResult.fail(
                    EligibilityReason.POLICY_CANCELLED,
                    "BenefitPolicy: " + benefitPolicy.getName()
                );
            
            case DRAFT:
            default:
                return RuleResult.fail(
                    EligibilityReason.POLICY_INACTIVE,
                    "BenefitPolicy status: " + status
                );
        }
    }
    
    private RuleResult evaluateLegacyPolicy(Policy policy) {
        // Also check the active flag
        if (!Boolean.TRUE.equals(policy.getActive())) {
            return RuleResult.fail(
                EligibilityReason.POLICY_INACTIVE,
                "Policy: " + policy.getPolicyNumber()
            );
        }

        Policy.PolicyStatus status = policy.getStatus();
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
