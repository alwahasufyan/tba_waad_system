package com.waad.tba.modules.preauth.entity;

import java.util.Collections;
import java.util.Set;

/**
 * Pre-Authorization Status Lifecycle Enum.
 * 
 * WORKFLOW:
 * ┌───────────┐
 * │ REQUESTED │ ─── Initial state when provider submits request
 * └─────┬─────┘
 *       │ startReview()
 *       ▼
 * ┌──────────────┐       ┌─────────────────────┐
 * │ UNDER_REVIEW │──────▶│ MORE_INFO_REQUIRED  │
 * └──────┬───────┘       └──────────┬──────────┘
 *        │                          │ resubmit()
 *        │ ◄────────────────────────┘
 *        │
 *   ┌────┴────┐
 *   ▼         ▼
 * ┌──────────┐  ┌──────────┐
 * │ APPROVED │  │ REJECTED │
 * └────┬─────┘  └──────────┘
 *      │ expire() (automatic after validity period)
 *      ▼
 * ┌──────────┐
 * │ EXPIRED  │
 * └──────────┘
 * 
 * ROLE PERMISSIONS:
 * | Transition                    | Allowed Roles                    |
 * |-------------------------------|----------------------------------|
 * | REQUESTED → UNDER_REVIEW      | INSURANCE, REVIEWER              |
 * | UNDER_REVIEW → APPROVED       | INSURANCE, REVIEWER              |
 * | UNDER_REVIEW → REJECTED       | INSURANCE, REVIEWER              |
 * | UNDER_REVIEW → MORE_INFO      | REVIEWER                         |
 * | MORE_INFO → REQUESTED         | EMPLOYER (resubmit)              |
 * | APPROVED → EXPIRED            | SYSTEM (automatic)               |
 */
public enum PreAuthStatus {
    /**
     * Initial state - request submitted by provider/employer
     */
    REQUESTED("مطلوب", false, false),
    
    /**
     * Under review by insurance/reviewer
     */
    UNDER_REVIEW("قيد المراجعة", false, false),
    
    /**
     * Additional information required from provider
     */
    MORE_INFO_REQUIRED("مطلوب معلومات إضافية", false, false),
    
    /**
     * Approved for the requested service
     */
    APPROVED("موافق عليه", true, false),
    
    /**
     * Rejected with reason
     */
    REJECTED("مرفوض", true, true),
    
    /**
     * Approval expired (validity period passed)
     */
    EXPIRED("منتهي الصلاحية", true, true);

    private final String arabicLabel;
    private final boolean requiresReviewerAction;
    private final boolean terminal;

    PreAuthStatus(String arabicLabel, boolean requiresReviewerAction, boolean terminal) {
        this.arabicLabel = arabicLabel;
        this.requiresReviewerAction = requiresReviewerAction;
        this.terminal = terminal;
    }

    public String getArabicLabel() {
        return arabicLabel;
    }

    public boolean requiresReviewerAction() {
        return requiresReviewerAction;
    }

    public boolean isTerminal() {
        return terminal;
    }

    /**
     * Check if pre-authorization can be used for claims (only APPROVED and not expired)
     */
    public boolean isUsableForClaim() {
        return this == APPROVED;
    }

    /**
     * Get valid next statuses from current status.
     */
    public Set<PreAuthStatus> getValidTransitions() {
        return switch (this) {
            case REQUESTED -> Set.of(UNDER_REVIEW);
            case UNDER_REVIEW -> Set.of(APPROVED, REJECTED, MORE_INFO_REQUIRED);
            case MORE_INFO_REQUIRED -> Set.of(REQUESTED); // Resubmit
            case APPROVED -> Set.of(EXPIRED); // Only system can expire
            case REJECTED, EXPIRED -> Collections.emptySet(); // Terminal
        };
    }

    /**
     * Check if transition to target status is valid.
     */
    public boolean canTransitionTo(PreAuthStatus target) {
        return getValidTransitions().contains(target);
    }
}
