package com.waad.tba.modules.eligibility.rules;

import com.waad.tba.modules.eligibility.domain.EligibilityContext;
import com.waad.tba.modules.eligibility.domain.EligibilityReason;
import com.waad.tba.modules.eligibility.domain.EligibilityRule;
import com.waad.tba.modules.eligibility.domain.RuleResult;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.policy.entity.Policy;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Rule: Member Enrollment
 * Phase E1 - Eligibility Engine
 * 
 * Validates that the member is enrolled in the given policy.
 * Checks that the member's policy reference matches the policy being checked.
 * 
 * This is a hard rule - failure stops evaluation.
 * 
 * Priority: 60
 * 
 * @author TBA WAAD System
 * @version 2025.1
 */
@Component
@Order(60)
public class MemberEnrollmentRule implements EligibilityRule {

    @Override
    public String getRuleCode() {
        return "MEMBER_ENROLLMENT";
    }

    @Override
    public String getNameAr() {
        return "التحقق من تسجيل العضو في الوثيقة";
    }

    @Override
    public int getPriority() {
        return 60;
    }

    @Override
    public boolean isHardRule() {
        return true;
    }

    @Override
    public boolean isApplicable(EligibilityContext context) {
        return context.hasMember() && context.hasPolicy();
    }

    @Override
    public RuleResult evaluate(EligibilityContext context) {
        Member member = context.getMember();
        Policy policy = context.getPolicy();

        // Check 1: Member has a policy reference
        Policy memberPolicy = member.getPolicy();
        if (memberPolicy == null && member.getPolicyNumber() == null) {
            // Member is not enrolled in any policy
            return RuleResult.fail(
                EligibilityReason.MEMBER_NOT_ENROLLED,
                "Member has no policy assigned"
            );
        }

        // Check 2: Policy reference matches
        boolean policyMatches = false;

        // Check by policy ID
        if (memberPolicy != null && memberPolicy.getId() != null) {
            policyMatches = memberPolicy.getId().equals(policy.getId());
        }

        // Also check by policy number (fallback)
        if (!policyMatches && member.getPolicyNumber() != null) {
            policyMatches = member.getPolicyNumber().equals(policy.getPolicyNumber());
        }

        // Check 3: Same employer
        if (!policyMatches) {
            // Check if member's employer matches policy's employer
            Long memberEmployerId = context.getMemberEmployerId();
            Long policyEmployerId = context.getPolicyEmployerId();
            
            if (memberEmployerId != null && policyEmployerId != null) {
                policyMatches = memberEmployerId.equals(policyEmployerId);
            }
        }

        if (!policyMatches) {
            return RuleResult.fail(
                EligibilityReason.MEMBER_NOT_ENROLLED,
                String.format(
                    "Member: %s is not enrolled in Policy: %s",
                    member.getFullName(),
                    policy.getPolicyNumber()
                )
            );
        }

        return RuleResult.pass();
    }
}
