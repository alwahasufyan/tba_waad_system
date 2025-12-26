package com.waad.tba.modules.member.util;

public class CardNumberGenerator {
    public static String generate() {
        // Format: WAAD|MEMBER|{TIMESTAMP_SUFFIX}{RANDOM}
        // Example: WAAD|MEMBER|1735234859123
        // Using System.currentTimeMillis() (last 8 digits) + Random (4 digits) to
        // ensure uniqueness and "sequence-like" growth
        long timestamp = System.currentTimeMillis();
        String timeSuffix = String.valueOf(timestamp).substring(String.valueOf(timestamp).length() - 9);
        int random = (int) (Math.random() * 9000) + 1000;
        return "WAAD|MEMBER|" + timeSuffix + random;
    }
}
