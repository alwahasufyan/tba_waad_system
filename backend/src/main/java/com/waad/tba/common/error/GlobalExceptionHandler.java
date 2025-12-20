package com.waad.tba.common.error;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.waad.tba.common.exception.BusinessRuleException;
import com.waad.tba.common.exception.ClaimStateTransitionException;
import com.waad.tba.common.exception.CoverageValidationException;
import com.waad.tba.common.exception.PolicyNotActiveException;
import com.waad.tba.common.exception.ResourceNotFoundException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Global Exception Handler with Phase 6 Business Exceptions.
 * 
 * Handles all application exceptions and returns standardized ApiError responses.
 * 
 * Exception Hierarchy:
 * - BusinessRuleException (base for business rules)
 *   - PolicyNotActiveException (policy validation failures)
 *   - CoverageValidationException (coverage/limit failures)
 *   - ClaimStateTransitionException (invalid state transitions)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private String now() { return Instant.now().toString(); }

    private String generateTrackingId() { return UUID.randomUUID().toString(); }

    private ResponseEntity<ApiError> build(HttpStatus status, ErrorCode code, String message, HttpServletRequest request, Object details) {
        String trackingId = generateTrackingId();
        ApiError error = ApiError.of(code, message, request.getRequestURI(), details, now(), trackingId);
        return ResponseEntity.status(status).body(error);
    }

    // ========== Phase 6: Business Rule Exceptions ==========

    /**
     * Handle PolicyNotActiveException - returns 422 Unprocessable Entity.
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "code": "POLICY_NOT_ACTIVE",
     *   "message": "Policy P001 is not active on 2025-01-15",
     *   "path": "/api/claims",
     *   "details": { "policyNumber": "P001", "requestedDate": "2025-01-15" }
     * }
     */
    @ExceptionHandler(PolicyNotActiveException.class)
    public ResponseEntity<ApiError> handlePolicyNotActive(PolicyNotActiveException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Policy validation failed - Path: {}, Message: {}, TrackingId: {}", 
            request.getRequestURI(), ex.getMessage(), trackingId);
        
        Map<String, Object> details = new HashMap<>();
        if (ex.getPolicyNumber() != null) {
            details.put("policyNumber", ex.getPolicyNumber());
        }
        if (ex.getRequestedDate() != null) {
            details.put("requestedDate", ex.getRequestedDate().toString());
        }
        
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), request, 
            details.isEmpty() ? null : details);
    }

    /**
     * Handle CoverageValidationException - returns 422 Unprocessable Entity.
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "code": "COVERAGE_VALIDATION_FAILED",
     *   "message": "Dental services not covered in benefit package Gold",
     *   "details": { "issue": "SERVICE_NOT_COVERED", "serviceCode": "DEN-001" }
     * }
     */
    @ExceptionHandler(CoverageValidationException.class)
    public ResponseEntity<ApiError> handleCoverageValidation(CoverageValidationException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Coverage validation failed - Path: {}, Issue: {}, Message: {}, TrackingId: {}", 
            request.getRequestURI(), ex.getIssue(), ex.getMessage(), trackingId);
        
        Map<String, Object> details = new HashMap<>();
        details.put("issue", ex.getIssue().name());
        if (ex.getServiceCode() != null) {
            details.put("serviceCode", ex.getServiceCode());
        }
        if (ex.getRequestedAmount() != null) {
            details.put("requestedAmount", ex.getRequestedAmount());
        }
        if (ex.getAvailableLimit() != null) {
            details.put("availableLimit", ex.getAvailableLimit());
        }
        
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), request, details);
    }

    /**
     * Handle ClaimStateTransitionException - returns 409 Conflict.
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "code": "INVALID_CLAIM_TRANSITION",
     *   "message": "Invalid state transition: DRAFT → APPROVED",
     *   "details": { "fromStatus": "DRAFT", "toStatus": "APPROVED", "requiredRole": "INSURANCE" }
     * }
     */
    @ExceptionHandler(ClaimStateTransitionException.class)
    public ResponseEntity<ApiError> handleClaimTransition(ClaimStateTransitionException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Claim state transition failed - Path: {}, From: {}, To: {}, TrackingId: {}", 
            request.getRequestURI(), ex.getFromStatus(), ex.getToStatus(), trackingId);
        
        Map<String, Object> details = new HashMap<>();
        if (ex.getFromStatus() != null) {
            details.put("fromStatus", ex.getFromStatus());
        }
        if (ex.getToStatus() != null) {
            details.put("toStatus", ex.getToStatus());
        }
        if (ex.getRequiredRole() != null) {
            details.put("requiredRole", ex.getRequiredRole());
        }
        
        return build(HttpStatus.CONFLICT, ex.getErrorCode(), ex.getMessage(), request, 
            details.isEmpty() ? null : details);
    }

    /**
     * Handle generic BusinessRuleException - returns 422 Unprocessable Entity.
     */
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiError> handleBusinessRule(BusinessRuleException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Business rule violation - Path: {}, Code: {}, Message: {}, TrackingId: {}", 
            request.getRequestURI(), ex.getErrorCode(), ex.getMessage(), trackingId);
        
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    // ========== Existing Exception Handlers ==========

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        String path = request.getRequestURI();
        
        log.warn("Resource not found - Path: {}, Message: {}, TrackingId: {}", path, ex.getMessage(), trackingId);
        
        ErrorCode code;
        if (path.contains("/claims")) code = ErrorCode.CLAIM_NOT_FOUND;
        else if (path.contains("/admin/users")) code = ErrorCode.USER_NOT_FOUND;
        else if (path.contains("/employers")) code = ErrorCode.EMPLOYER_NOT_FOUND;
        else if (path.contains("/members")) code = ErrorCode.MEMBER_NOT_FOUND;
        else if (path.contains("/policies")) code = ErrorCode.POLICY_NOT_FOUND;
        else code = ErrorCode.INTERNAL_ERROR;
        
        return build(HttpStatus.NOT_FOUND, code, ex.getMessage(), request, null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Bad request - Path: {}, Message: {}, TrackingId: {}", request.getRequestURI(), ex.getMessage(), trackingId);
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> fieldErrors.put(fe.getField(), fe.getDefaultMessage()));
        
        log.warn("Validation failed - Path: {}, Errors: {}, TrackingId: {}", request.getRequestURI(), fieldErrors, trackingId);
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Validation failed", request, fieldErrors);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Authentication failed - Path: {}, User-Agent: {}, TrackingId: {}", 
                 request.getRequestURI(), request.getHeader("User-Agent"), trackingId);
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "Invalid username or password", request, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        log.warn("Access denied - Path: {}, Message: {}, TrackingId: {}", 
                 request.getRequestURI(), ex.getMessage(), trackingId);
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, "Access is denied", request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        // Log the exception with full stack trace
        log.error("Unexpected error occurred - Path: {}, TrackingId: {}", request.getRequestURI(), trackingId, ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, ex.getMessage(), request, null);
    }
}

