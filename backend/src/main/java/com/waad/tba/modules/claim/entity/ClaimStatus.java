package com.waad.tba.modules.claim.entity;

public enum ClaimStatus {
    PENDING_REVIEW("قيد المراجعة"),
    PREAPPROVED("موافقة مسبقة"),
    APPROVED("موافق عليه"),
    PARTIALLY_APPROVED("موافق جزئياً"),
    REJECTED("مرفوض"),
    RETURNED_FOR_INFO("إعادة للاستكمال"),
    CANCELLED("ملغي");

    private final String arabicLabel;

    ClaimStatus(String arabicLabel) {
        this.arabicLabel = arabicLabel;
    }

    public String getArabicLabel() {
        return arabicLabel;
    }
}
