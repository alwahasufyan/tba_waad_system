package com.waad.tba.modules.member.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for member import preview.
 * Shows parsed rows before confirmation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberImportPreviewDto {
    
    /**
     * Unique batch ID for this import session
     */
    private String batchId;
    
    /**
     * Original file name
     */
    private String fileName;
    
    /**
     * Total rows found in Excel (excluding header)
     */
    private int totalRows;
    
    /**
     * Rows that will be created (new card numbers)
     */
    private int newCount;
    
    /**
     * Rows that will be updated (existing card numbers)
     */
    private int updateCount;
    
    /**
     * Rows with validation errors
     */
    private int errorCount;
    
    /**
     * Column headers detected in Excel
     */
    private List<String> detectedColumns;
    
    /**
     * Mapped columns (Excel header → field)
     */
    private Map<String, String> columnMappings;
    
    /**
     * Preview of first N rows (parsed data)
     */
    private List<MemberImportRowDto> previewRows;
    
    /**
     * Validation errors found
     */
    private List<ImportValidationErrorDto> validationErrors;
    
    /**
     * Is the preview ready to be confirmed?
     */
    private boolean canProceed;
    
    /**
     * Key used for matching existing members
     */
    private String matchKeyUsed;
    private List<String> warnings;
    
    /**
     * Single row in preview
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberImportRowDto {
        private int rowNumber;
        private String cardNumber;
        private String fullName;
        private String employerName;
        private String policyNumber;
        private String status;  // NEW, UPDATE, ERROR
        private Map<String, String> attributes;  // Extra columns
        private List<String> errors;
    }
    
    /**
     * Validation error for a row
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportValidationErrorDto {
        private int rowNumber;
        private String field;
        private String value;
        private String message;
    }
}
