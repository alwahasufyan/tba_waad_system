package com.waad.tba.modules.member.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.modules.member.dto.MemberImportPreviewDto;
import com.waad.tba.modules.member.dto.MemberImportResultDto;
import com.waad.tba.modules.member.entity.MemberImportLog;
import com.waad.tba.modules.member.repository.MemberImportErrorRepository;
import com.waad.tba.modules.member.repository.MemberImportLogRepository;
import com.waad.tba.modules.member.service.MemberExcelImportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for member bulk import from Excel.
 * 
 * Supports Odoo hr.employee.public exports.
 */
@Slf4j
@RestController
@RequestMapping("/api/members/import")
@RequiredArgsConstructor
@Tag(name = "Member Import", description = "Bulk member import from Excel")
public class MemberImportController {

    private final MemberExcelImportService importService;
    private final MemberImportLogRepository importLogRepository;
    private final MemberImportErrorRepository importErrorRepository;

    /**
     * Upload Excel and get preview (without importing).
     * 
     * POST /api/members/import/preview
     * Content-Type: multipart/form-data
     * 
     * Returns parsed data for user confirmation.
     */
    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('members.import')")
    @Operation(
        summary = "Preview Excel import",
        description = "Upload Excel file and preview data before import. Returns validation errors and mapping."
    )
    public ResponseEntity<ApiResponse<MemberImportPreviewDto>> previewImport(
            @Parameter(description = "Excel file (.xlsx)")
            @RequestParam("file") MultipartFile file) {
        
        log.info("📊 Preview import request: {}", file.getOriginalFilename());
        
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("الملف فارغ"));
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("يجب رفع ملف Excel (.xlsx أو .xls)"));
        }
        
        try {
            MemberImportPreviewDto preview = importService.parseAndPreview(file);
            return ResponseEntity.ok(ApiResponse.success("تم تحليل الملف بنجاح", preview));
        } catch (Exception e) {
            log.error("❌ Preview failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("فشل تحليل الملف: " + e.getMessage()));
        }
    }

    /**
     * Execute import after confirmation.
     * 
     * POST /api/members/import/execute
     * Content-Type: multipart/form-data
     * 
     * Creates/updates members and returns result.
     */
    @PostMapping(value = "/execute", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('members.import')")
    @Operation(
        summary = "Execute Excel import",
        description = "Import members from Excel file. Creates new members or updates existing by national ID."
    )
    public ResponseEntity<ApiResponse<MemberImportResultDto>> executeImport(
            @Parameter(description = "Excel file (.xlsx)")
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Batch ID from preview (optional)")
            @RequestParam(value = "batchId", required = false) String batchId) {
        
        log.info("📥 Execute import request: {}, batchId={}", file.getOriginalFilename(), batchId);
        
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("الملف فارغ"));
        }
        
        // Generate batch ID if not provided
        if (batchId == null || batchId.isBlank()) {
            batchId = UUID.randomUUID().toString();
        }
        
        try {
            MemberImportResultDto result = importService.executeImport(file, batchId);
            
            String status = result.getStatus();
            if ("COMPLETED".equals(status)) {
                return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
            } else if ("PARTIAL".equals(status)) {
                return ResponseEntity.ok(ApiResponse.success(
                        "تم الاستيراد مع بعض الأخطاء: " + result.getMessage(), result));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("فشل الاستيراد: " + result.getMessage()));
            }
            
        } catch (Exception e) {
            log.error("❌ Import failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("فشل الاستيراد: " + e.getMessage()));
        }
    }

    /**
     * Get import history (logs).
     * 
     * GET /api/members/import/logs
     */
    @GetMapping("/logs")
    @PreAuthorize("hasAuthority('members.import_logs')")
    @Operation(summary = "Get import history", description = "List all import logs with pagination")
    public ResponseEntity<ApiResponse<Page<MemberImportLog>>> getImportLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<MemberImportLog> logs = importLogRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        
        return ResponseEntity.ok(ApiResponse.success("Import logs retrieved", logs));
    }

    /**
     * Get import log by batch ID.
     * 
     * GET /api/members/import/logs/{batchId}
     */
    @GetMapping("/logs/{batchId}")
    @PreAuthorize("hasAuthority('members.import_logs')")
    @Operation(summary = "Get import log by batch ID")
    public ResponseEntity<ApiResponse<MemberImportLog>> getImportLog(
            @PathVariable String batchId) {
        
        return importLogRepository.findByImportBatchId(batchId)
                .map(log -> ResponseEntity.ok(ApiResponse.success("Import log found", log)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get errors for an import batch.
     * 
     * GET /api/members/import/logs/{batchId}/errors
     */
    @GetMapping("/logs/{batchId}/errors")
    @PreAuthorize("hasAuthority('members.import_logs')")
    @Operation(summary = "Get errors for import batch")
    public ResponseEntity<ApiResponse<?>> getImportErrors(
            @PathVariable String batchId) {
        
        var errors = importErrorRepository.findByImportBatchId(batchId);
        return ResponseEntity.ok(ApiResponse.success("Import errors retrieved", errors));
    }

    /**
     * Download import template.
     * 
     * GET /api/members/import/template
     */
    @GetMapping("/template")
    @PreAuthorize("hasAuthority('members.import')")
    @Operation(summary = "Get import template info", description = "Returns expected column mappings")
    public ResponseEntity<ApiResponse<?>> getTemplate() {
        var template = java.util.Map.of(
            "mandatory_columns", java.util.List.of(
                java.util.Map.of("name", "national_id", "aliases", "identification_id, civil_id, الرقم الوطني"),
                java.util.Map.of("name", "full_name", "aliases", "name, full_name_arabic, الاسم الكامل"),
                java.util.Map.of("name", "employer", "aliases", "company, company_id, جهة العمل"),
                java.util.Map.of("name", "policy", "aliases", "policy_number, policy_id, الوثيقة")
            ),
            "optional_columns", java.util.List.of(
                "full_name_english", "birth_date", "gender", "phone", "email", 
                "nationality", "employee_number"
            ),
            "attribute_columns", java.util.List.of(
                java.util.Map.of("name", "job_title", "description", "الوظيفة"),
                java.util.Map.of("name", "department", "description", "القسم/الإدارة"),
                java.util.Map.of("name", "work_location", "description", "موقع العمل"),
                java.util.Map.of("name", "grade", "description", "الدرجة/المستوى"),
                java.util.Map.of("name", "manager", "description", "المدير"),
                java.util.Map.of("name", "cost_center", "description", "مركز التكلفة")
            ),
            "notes", java.util.List.of(
                "Any extra columns will be stored as member attributes",
                "Duplicate national_id → updates existing member",
                "Compatible with Odoo hr.employee.public exports"
            )
        );
        
        return ResponseEntity.ok(ApiResponse.success("Import template info", template));
    }
}
