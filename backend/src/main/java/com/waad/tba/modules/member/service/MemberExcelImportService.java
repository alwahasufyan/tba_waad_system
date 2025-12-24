package com.waad.tba.modules.member.service;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waad.tba.common.exception.BusinessRuleException;
import com.waad.tba.modules.employer.entity.Employer;
import com.waad.tba.modules.employer.repository.EmployerRepository;
import com.waad.tba.modules.member.dto.MemberImportPreviewDto;
import com.waad.tba.modules.member.dto.MemberImportPreviewDto.ImportValidationErrorDto;
import com.waad.tba.modules.member.dto.MemberImportPreviewDto.MemberImportRowDto;
import com.waad.tba.modules.member.dto.MemberImportResultDto;
import com.waad.tba.modules.member.dto.MemberImportResultDto.ImportErrorDetailDto;
import com.waad.tba.modules.member.entity.Member;
import com.waad.tba.modules.member.entity.Member.Gender;
import com.waad.tba.modules.member.entity.Member.MemberStatus;
import com.waad.tba.modules.member.entity.MemberAttribute;
import com.waad.tba.modules.member.entity.MemberAttribute.AttributeSource;
import com.waad.tba.modules.member.entity.MemberImportError;
import com.waad.tba.modules.member.entity.MemberImportLog;
import com.waad.tba.modules.member.entity.MemberImportLog.ImportStatus;
import com.waad.tba.modules.member.repository.MemberAttributeRepository;
import com.waad.tba.modules.member.repository.MemberImportErrorRepository;
import com.waad.tba.modules.member.repository.MemberImportLogRepository;
import com.waad.tba.modules.member.repository.MemberRepository;
import com.waad.tba.modules.policy.entity.Policy;
import com.waad.tba.modules.policy.repository.PolicyRepository;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.security.AuthorizationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for importing members from Excel files.
 * 
 * Compatible with Odoo hr.employee.public exports.
 * 
 * UNIQUE IDENTIFIER: card_number (Member Insurance Number)
 * - Members are matched ONLY by card_number
 * - card_number is mandatory for import
 * - Rows without card_number are rejected
 * 
 * Column Mappings (Odoo → TBA):
 * - card_number / member_no / insurance_no → cardNumber (MANDATORY, unique key)
 * - name / full_name → fullNameArabic (MANDATORY)
 * - full_name_english → fullNameEnglish (optional)
 * - company / employer → employer (lookup)
 * - policy → policy (lookup)
 * - national_id / civil_id → civilId (optional)
 * - job_title → attribute(job_title)
 * - department / department_id → attribute(department)
 * - work_location / work_location_id → attribute(work_location)
 * - Any other columns → attribute(column_name)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberExcelImportService {

    private final MemberRepository memberRepository;
    private final MemberAttributeRepository attributeRepository;
    private final MemberImportLogRepository importLogRepository;
    private final MemberImportErrorRepository importErrorRepository;
    private final EmployerRepository employerRepository;
    private final PolicyRepository policyRepository;
    private final AuthorizationService authorizationService;
    private final ObjectMapper objectMapper;

    // ═══════════════════════════════════════════════════════════════════════════
    // COLUMN MAPPINGS (Odoo Compatible)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Mandatory columns (at least one variant required)
     * card_number is the ONLY unique identifier for matching members
     */
    private static final List<String[]> MANDATORY_COLUMNS = List.of(
            new String[]{"card_number", "cardnumber", "member_no", "member_number", "insurance_no", "insurance_number", "رقم البطاقة", "رقم العضوية"},
            new String[]{"full_name", "name", "full_name_arabic", "الاسم الكامل", "الاسم"},
            new String[]{"employer", "company", "company_id", "employer_name", "جهة العمل", "الشركة"},
            new String[]{"policy", "policy_number", "policy_id", "رقم الوثيقة", "الوثيقة"}
    );

    /**
     * Optional core field mappings
     * NOTE: national_id/civil_id is now OPTIONAL - card_number is the unique identifier
     */
    private static final Map<String, String[]> OPTIONAL_FIELD_MAPPINGS = Map.of(
            "civilId", new String[]{"national_id", "identification_id", "civil_id", "civilid", "الرقم الوطني"},
            "fullNameEnglish", new String[]{"full_name_english", "name_english", "english_name"},
            "birthDate", new String[]{"birth_date", "birthday", "dob", "date_of_birth", "تاريخ الميلاد"},
            "gender", new String[]{"gender", "sex", "الجنس"},
            "phone", new String[]{"phone", "mobile", "mobile_phone", "work_phone", "الهاتف", "الجوال"},
            "email", new String[]{"email", "work_email", "البريد الإلكتروني"},
            "nationality", new String[]{"nationality", "country", "الجنسية"},
            "employeeNumber", new String[]{"employee_number", "employee_id", "badge_id", "barcode", "رقم الموظف"}
    );

    /**
     * Columns that go to attributes (Odoo fields)
     */
    private static final Map<String, String[]> ATTRIBUTE_MAPPINGS = Map.of(
            "job_title", new String[]{"job_title", "job_id", "job", "الوظيفة", "المسمى الوظيفي"},
            "department", new String[]{"department", "department_id", "القسم", "الإدارة"},
            "work_location", new String[]{"work_location", "work_location_id", "location", "موقع العمل"},
            "grade", new String[]{"grade", "x_grade", "level", "الدرجة", "المستوى"},
            "manager", new String[]{"manager", "parent_id", "manager_name", "المدير"},
            "cost_center", new String[]{"cost_center", "x_cost_center", "مركز التكلفة"}
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // PREVIEW (Parse and Validate without committing)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Parse Excel file and return preview without importing.
     */
    public MemberImportPreviewDto parseAndPreview(MultipartFile file) throws Exception {
        log.info("📊 Parsing Excel file for preview: {}", file.getOriginalFilename());

        String batchId = UUID.randomUUID().toString();
        List<MemberImportRowDto> previewRows = new ArrayList<>();
        List<ImportValidationErrorDto> validationErrors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        Map<String, String> columnMappings = new LinkedHashMap<>();
        List<String> detectedColumns = new ArrayList<>();

        int newCount = 0;
        int updateCount = 0;
        int errorCount = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();  // Excluding header

            // Parse header row
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BusinessRuleException("Excel file has no header row");
            }

            Map<Integer, String> columnIndexToName = new HashMap<>();
            Map<String, Integer> fieldToColumnIndex = new HashMap<>();

            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                String colName = getCellStringValue(cell).trim().toLowerCase();
                columnIndexToName.put(i, colName);
                detectedColumns.add(getCellStringValue(cell).trim());

                // Map to core fields
                mapColumnToField(colName, i, fieldToColumnIndex, columnMappings);
            }

            // Validate mandatory columns exist
            validateMandatoryColumns(fieldToColumnIndex, validationErrors);

            // Parse data rows (limit preview to 50 rows)
            int previewLimit = Math.min(totalRows, 50);
            Set<String> seenCardNumbers = new HashSet<>();

            for (int rowNum = 1; rowNum <= totalRows; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null || isEmptyRow(row)) continue;

                MemberImportRowDto rowDto = parseRow(row, rowNum, fieldToColumnIndex, 
                        columnIndexToName, validationErrors, seenCardNumbers);

                // Check if update or new based on card_number (ONLY unique identifier)
                if (rowDto.getCardNumber() != null && !rowDto.getCardNumber().isBlank()) {
                    boolean exists = memberRepository.existsByCardNumber(rowDto.getCardNumber());
                    if (exists) {
                        rowDto.setStatus("UPDATE");
                        updateCount++;
                    } else {
                        rowDto.setStatus("NEW");
                        newCount++;
                    }
                } else {
                    rowDto.setStatus("ERROR");
                    errorCount++;
                }

                if (rowDto.getErrors() != null && !rowDto.getErrors().isEmpty()) {
                    errorCount++;
                    rowDto.setStatus("ERROR");
                }

                if (rowNum <= previewLimit) {
                    previewRows.add(rowDto);
                }
            }

            // Add warnings
            if (totalRows > previewLimit) {
                warnings.add(String.format("عرض أول %d صف من إجمالي %d صف", previewLimit, totalRows));
            }

            return MemberImportPreviewDto.builder()
                    .batchId(batchId)
                    .fileName(file.getOriginalFilename())
                    .totalRows(totalRows)
                    .newCount(newCount)
                    .updateCount(updateCount)
                    .errorCount(errorCount)
                    .detectedColumns(detectedColumns)
                    .columnMappings(columnMappings)
                    .previewRows(previewRows)
                    .validationErrors(validationErrors)
                    .canProceed(errorCount == 0 || (newCount + updateCount > 0))
                    .matchKeyUsed("CARD_NUMBER")
                    .warnings(warnings)
                    .build();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IMPORT (Commit after confirmation)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Execute import after user confirmation.
     */
    @Transactional
    public MemberImportResultDto executeImport(MultipartFile file, String batchId) throws Exception {
        log.info("📥 Executing member import: batchId={}, file={}", batchId, file.getOriginalFilename());

        User currentUser = authorizationService.getCurrentUser();
        
        // Create import log
        MemberImportLog importLog = MemberImportLog.builder()
                .importBatchId(batchId)
                .fileName(file.getOriginalFilename())
                .fileSizeBytes(file.getSize())
                .status(ImportStatus.PROCESSING)
                .importedByUserId(currentUser != null ? currentUser.getId() : null)
                .importedByUsername(currentUser != null ? currentUser.getUsername() : "system")
                .build();
        importLog.markStarted();
        importLog = importLogRepository.save(importLog);

        List<ImportErrorDetailDto> errors = new ArrayList<>();
        int totalProcessed = 0;
        int createdCount = 0;
        int updatedCount = 0;
        int skippedCount = 0;
        int errorCount = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();
            importLog.setTotalRows(totalRows);

            // Parse header
            Row headerRow = sheet.getRow(0);
            Map<Integer, String> columnIndexToName = new HashMap<>();
            Map<String, Integer> fieldToColumnIndex = new HashMap<>();
            Map<String, String> columnMappings = new LinkedHashMap<>();

            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                String colName = getCellStringValue(headerRow.getCell(i)).trim().toLowerCase();
                columnIndexToName.put(i, colName);
                mapColumnToField(colName, i, fieldToColumnIndex, columnMappings);
            }

            // Process rows
            for (int rowNum = 1; rowNum <= totalRows; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null || isEmptyRow(row)) {
                    skippedCount++;
                    continue;
                }

                totalProcessed++;

                try {
                    ImportRowResult result = processRow(row, rowNum, fieldToColumnIndex, 
                            columnIndexToName, importLog);
                    
                    if (result.isCreated()) {
                        createdCount++;
                        importLog.incrementCreated();
                    } else if (result.isUpdated()) {
                        updatedCount++;
                        importLog.incrementUpdated();
                    } else if (result.isSkipped()) {
                        skippedCount++;
                        importLog.incrementSkipped();
                    }

                } catch (Exception e) {
                    errorCount++;
                    importLog.incrementError();
                    
                    String rowJson = rowToJson(row, columnIndexToName);
                    MemberImportError error = MemberImportError.systemError(
                            importLog, rowNum, e.getMessage(), rowJson);
                    importErrorRepository.save(error);
                    
                    errors.add(ImportErrorDetailDto.builder()
                            .rowNumber(rowNum)
                            .errorType("SYSTEM")
                            .message(e.getMessage())
                            .build());
                }
            }

            // Complete import
            importLog.setCreatedCount(createdCount);
            importLog.setUpdatedCount(updatedCount);
            importLog.setSkippedCount(skippedCount);
            importLog.setErrorCount(errorCount);
            importLog.markCompleted();
            importLogRepository.save(importLog);

            double successRate = totalProcessed > 0 
                    ? (double)(createdCount + updatedCount) / totalProcessed * 100 
                    : 0;

            String message = String.format(
                    "تم استيراد %d عضو: %d جديد، %d تحديث، %d أخطاء",
                    createdCount + updatedCount, createdCount, updatedCount, errorCount);

            log.info("✅ Import completed: {}", message);

            return MemberImportResultDto.builder()
                    .batchId(batchId)
                    .status(importLog.getStatus().name())
                    .totalProcessed(totalProcessed)
                    .createdCount(createdCount)
                    .updatedCount(updatedCount)
                    .skippedCount(skippedCount)
                    .errorCount(errorCount)
                    .processingTimeMs(importLog.getProcessingTimeMs())
                    .completedAt(importLog.getCompletedAt())
                    .successRate(successRate)
                    .errors(errors)
                    .message(message)
                    .build();

        } catch (Exception e) {
            log.error("❌ Import failed: {}", e.getMessage(), e);
            importLog.markFailed(e.getMessage());
            importLogRepository.save(importLog);
            throw e;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    private void mapColumnToField(String colName, int index, 
            Map<String, Integer> fieldToColumnIndex, Map<String, String> columnMappings) {
        
        // Mandatory columns - card_number is the UNIQUE identifier (index 0)
        for (int i = 0; i < MANDATORY_COLUMNS.size(); i++) {
            String[] variants = MANDATORY_COLUMNS.get(i);
            String fieldName = i == 0 ? "cardNumber" : i == 1 ? "fullName" : i == 2 ? "employer" : "policy";
            
            for (String variant : variants) {
                if (colName.equalsIgnoreCase(variant) || colName.contains(variant)) {
                    fieldToColumnIndex.put(fieldName, index);
                    columnMappings.put(colName, fieldName);
                    return;
                }
            }
        }

        // Optional core fields (including civilId which is now optional)
        for (Map.Entry<String, String[]> entry : OPTIONAL_FIELD_MAPPINGS.entrySet()) {
            for (String variant : entry.getValue()) {
                if (colName.equalsIgnoreCase(variant) || colName.contains(variant)) {
                    fieldToColumnIndex.put(entry.getKey(), index);
                    columnMappings.put(colName, entry.getKey());
                    return;
                }
            }
        }

        // Attribute columns
        for (Map.Entry<String, String[]> entry : ATTRIBUTE_MAPPINGS.entrySet()) {
            for (String variant : entry.getValue()) {
                if (colName.equalsIgnoreCase(variant) || colName.contains(variant)) {
                    fieldToColumnIndex.put("attr:" + entry.getKey(), index);
                    columnMappings.put(colName, "attribute:" + entry.getKey());
                    return;
                }
            }
        }

        // Unknown column → becomes attribute
        String normalized = colName.replaceAll("[^a-z0-9_]", "_").replaceAll("_+", "_");
        if (!normalized.isBlank()) {
            fieldToColumnIndex.put("attr:" + normalized, index);
            columnMappings.put(colName, "attribute:" + normalized);
        }
    }

    private void validateMandatoryColumns(Map<String, Integer> fieldToColumnIndex,
            List<ImportValidationErrorDto> errors) {
        
        // card_number is the ONLY unique identifier - MANDATORY
        if (!fieldToColumnIndex.containsKey("cardNumber")) {
            errors.add(ImportValidationErrorDto.builder()
                    .rowNumber(0)
                    .field("header")
                    .message("Missing mandatory column: card_number / member_no / insurance_no (رقم البطاقة)")
                    .build());
        }
        if (!fieldToColumnIndex.containsKey("fullName")) {
            errors.add(ImportValidationErrorDto.builder()
                    .rowNumber(0)
                    .field("header")
                    .message("Missing mandatory column: full_name / name (الاسم الكامل)")
                    .build());
        }
        if (!fieldToColumnIndex.containsKey("employer")) {
            errors.add(ImportValidationErrorDto.builder()
                    .rowNumber(0)
                    .field("header")
                    .message("Missing mandatory column: employer / company (جهة العمل)")
                    .build());
        }
    }

    private MemberImportRowDto parseRow(Row row, int rowNum, 
            Map<String, Integer> fieldToColumnIndex,
            Map<Integer, String> columnIndexToName,
            List<ImportValidationErrorDto> validationErrors,
            Set<String> seenCardNumbers) {

        List<String> rowErrors = new ArrayList<>();
        Map<String, String> attributes = new HashMap<>();

        // Extract mandatory fields - card_number is the UNIQUE identifier
        String cardNumber = getFieldValue(row, fieldToColumnIndex, "cardNumber");
        String fullName = getFieldValue(row, fieldToColumnIndex, "fullName");
        String employerName = getFieldValue(row, fieldToColumnIndex, "employer");
        String policyNumber = getFieldValue(row, fieldToColumnIndex, "policy");

        // Validate card_number - MANDATORY unique identifier
        if (cardNumber == null || cardNumber.isBlank()) {
            rowErrors.add("رقم البطاقة مطلوب");
            validationErrors.add(ImportValidationErrorDto.builder()
                    .rowNumber(rowNum)
                    .field("card_number")
                    .message("رقم البطاقة مطلوب - Card number is required")
                    .build());
        } else if (seenCardNumbers.contains(cardNumber)) {
            rowErrors.add("رقم بطاقة مكرر في الملف");
            validationErrors.add(ImportValidationErrorDto.builder()
                    .rowNumber(rowNum)
                    .field("card_number")
                    .value(cardNumber)
                    .message("رقم بطاقة مكرر في الملف - Duplicate card number in file")
                    .build());
        } else {
            seenCardNumbers.add(cardNumber);
        }

        if (fullName == null || fullName.isBlank()) {
            rowErrors.add("الاسم الكامل مطلوب");
            validationErrors.add(ImportValidationErrorDto.builder()
                    .rowNumber(rowNum)
                    .field("full_name")
                    .message("الاسم الكامل مطلوب")
                    .build());
        }

        if (employerName == null || employerName.isBlank()) {
            rowErrors.add("جهة العمل مطلوبة");
            validationErrors.add(ImportValidationErrorDto.builder()
                    .rowNumber(rowNum)
                    .field("employer")
                    .message("جهة العمل مطلوبة")
                    .build());
        }

        // Extract attributes
        for (Map.Entry<String, Integer> entry : fieldToColumnIndex.entrySet()) {
            if (entry.getKey().startsWith("attr:")) {
                String attrCode = entry.getKey().substring(5);
                String attrValue = getCellStringValue(row.getCell(entry.getValue()));
                if (attrValue != null && !attrValue.isBlank()) {
                    attributes.put(attrCode, attrValue);
                }
            }
        }

        return MemberImportRowDto.builder()
                .rowNumber(rowNum)
                .cardNumber(cardNumber)
                .fullName(fullName)
                .employerName(employerName)
                .policyNumber(policyNumber)
                .attributes(attributes)
                .errors(rowErrors)
                .build();
    }

    private ImportRowResult processRow(Row row, int rowNum,
            Map<String, Integer> fieldToColumnIndex,
            Map<Integer, String> columnIndexToName,
            MemberImportLog importLog) {

        // Extract fields - card_number is the UNIQUE identifier
        String cardNumber = getFieldValue(row, fieldToColumnIndex, "cardNumber");
        String fullName = getFieldValue(row, fieldToColumnIndex, "fullName");
        String employerName = getFieldValue(row, fieldToColumnIndex, "employer");
        String policyNumber = getFieldValue(row, fieldToColumnIndex, "policy");
        
        // Optional: civil_id is no longer the matching key
        String civilId = getFieldValue(row, fieldToColumnIndex, "civilId");

        // Validate mandatory - card_number is REQUIRED
        if (cardNumber == null || cardNumber.isBlank() || 
            fullName == null || fullName.isBlank() ||
            employerName == null || employerName.isBlank()) {
            return ImportRowResult.skipped();
        }

        // Find employer
        Optional<Employer> employerOpt = employerRepository.findByNameIgnoreCase(employerName);
        if (employerOpt.isEmpty()) {
            // Try partial match
            List<Employer> matches = employerRepository.findByNameContainingIgnoreCase(employerName);
            if (!matches.isEmpty()) {
                employerOpt = Optional.of(matches.get(0));
            }
        }
        
        Employer employer = employerOpt.orElseThrow(() -> 
                new BusinessRuleException("Employer not found: " + employerName));

        // Find policy (optional)
        Policy policy = null;
        if (policyNumber != null && !policyNumber.isBlank()) {
            policy = policyRepository.findByPolicyNumber(policyNumber).orElse(null);
        }

        // Check if member exists by card_number (ONLY unique identifier)
        Optional<Member> existingOpt = memberRepository.findByCardNumber(cardNumber);
        Member member;
        boolean isNew = existingOpt.isEmpty();

        if (isNew) {
            member = Member.builder()
                    .cardNumber(cardNumber)
                    .civilId(civilId)  // Optional - store if provided
                    .fullNameArabic(fullName)
                    .employer(employer)
                    .policy(policy)
                    .status(MemberStatus.ACTIVE)
                    .active(true)
                    .build();
        } else {
            member = existingOpt.get();
            member.setFullNameArabic(fullName);
            member.setEmployer(employer);
            if (civilId != null && !civilId.isBlank()) {
                member.setCivilId(civilId);  // Update civil_id if provided
            }
            if (policy != null) {
                member.setPolicy(policy);
            }
        }

        // Optional core fields
        String fullNameEnglish = getFieldValue(row, fieldToColumnIndex, "fullNameEnglish");
        if (fullNameEnglish != null && !fullNameEnglish.isBlank()) {
            member.setFullNameEnglish(fullNameEnglish);
        }

        String phone = getFieldValue(row, fieldToColumnIndex, "phone");
        if (phone != null && !phone.isBlank()) {
            member.setPhone(phone);
        }

        String email = getFieldValue(row, fieldToColumnIndex, "email");
        if (email != null && !email.isBlank()) {
            member.setEmail(email);
        }

        String nationality = getFieldValue(row, fieldToColumnIndex, "nationality");
        if (nationality != null && !nationality.isBlank()) {
            member.setNationality(nationality);
        }

        String employeeNumber = getFieldValue(row, fieldToColumnIndex, "employeeNumber");
        if (employeeNumber != null && !employeeNumber.isBlank()) {
            member.setEmployeeNumber(employeeNumber);
        }

        String genderStr = getFieldValue(row, fieldToColumnIndex, "gender");
        if (genderStr != null && !genderStr.isBlank()) {
            Gender gender = parseGender(genderStr);
            if (gender != null) {
                member.setGender(gender);
            }
        } else if (member.getGender() == null) {
            member.setGender(Gender.MALE); // Default
        }

        String birthDateStr = getFieldValue(row, fieldToColumnIndex, "birthDate");
        if (birthDateStr != null && !birthDateStr.isBlank()) {
            LocalDate birthDate = parseDate(birthDateStr);
            if (birthDate != null) {
                member.setBirthDate(birthDate);
            }
        } else if (member.getBirthDate() == null) {
            member.setBirthDate(LocalDate.of(1990, 1, 1)); // Default
        }

        // Save member
        member = memberRepository.save(member);

        // Process attributes
        for (Map.Entry<String, Integer> entry : fieldToColumnIndex.entrySet()) {
            if (entry.getKey().startsWith("attr:")) {
                String attrCode = entry.getKey().substring(5);
                String attrValue = getCellStringValue(row.getCell(entry.getValue()));
                
                if (attrValue != null && !attrValue.isBlank()) {
                    saveOrUpdateAttribute(member, attrCode, attrValue, AttributeSource.IMPORT);
                }
            }
        }

        return isNew ? ImportRowResult.created() : ImportRowResult.updated();
    }

    private void saveOrUpdateAttribute(Member member, String code, String value, AttributeSource source) {
        Optional<MemberAttribute> existing = attributeRepository
                .findByMemberIdAndAttributeCode(member.getId(), code);
        
        MemberAttribute attr;
        if (existing.isPresent()) {
            attr = existing.get();
            attr.setAttributeValue(value);
            attr.setSource(source);
        } else {
            attr = MemberAttribute.builder()
                    .member(member)
                    .attributeCode(code)
                    .attributeValue(value)
                    .source(source)
                    .build();
        }
        attributeRepository.save(attr);
    }

    private String getFieldValue(Row row, Map<String, Integer> fieldToColumnIndex, String field) {
        Integer colIndex = fieldToColumnIndex.get(field);
        if (colIndex == null) return null;
        return getCellStringValue(row.getCell(colIndex));
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                yield String.valueOf((long) cell.getNumericCellValue());
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue();
                } catch (Exception e) {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            default -> null;
        };
    }

    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellStringValue(cell);
                if (value != null && !value.isBlank()) {
                    return false;
                }
            }
        }
        return true;
    }

    private Gender parseGender(String value) {
        if (value == null) return null;
        String v = value.toLowerCase().trim();
        if (v.contains("male") || v.contains("ذكر") || v.equals("m")) {
            return Gender.MALE;
        }
        if (v.contains("female") || v.contains("أنثى") || v.equals("f")) {
            return Gender.FEMALE;
        }
        return null;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            // Try ISO format
            return LocalDate.parse(value);
        } catch (Exception e1) {
            try {
                // Try dd/MM/yyyy
                String[] parts = value.split("[/\\-]");
                if (parts.length == 3) {
                    int day = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    int year = Integer.parseInt(parts[2]);
                    if (year < 100) year += 2000;
                    return LocalDate.of(year, month, day);
                }
            } catch (Exception e2) {
                log.warn("Could not parse date: {}", value);
            }
        }
        return null;
    }

    private String rowToJson(Row row, Map<Integer, String> columnIndexToName) {
        Map<String, String> data = new HashMap<>();
        for (Map.Entry<Integer, String> entry : columnIndexToName.entrySet()) {
            String value = getCellStringValue(row.getCell(entry.getKey()));
            if (value != null) {
                data.put(entry.getValue(), value);
            }
        }
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    /**
     * Result of processing a single row
     */
    private static class ImportRowResult {
        private final boolean created;
        private final boolean updated;
        private final boolean skipped;

        private ImportRowResult(boolean created, boolean updated, boolean skipped) {
            this.created = created;
            this.updated = updated;
            this.skipped = skipped;
        }

        static ImportRowResult created() { return new ImportRowResult(true, false, false); }
        static ImportRowResult updated() { return new ImportRowResult(false, true, false); }
        static ImportRowResult skipped() { return new ImportRowResult(false, false, true); }

        boolean isCreated() { return created; }
        boolean isUpdated() { return updated; }
        boolean isSkipped() { return skipped; }
    }
}
