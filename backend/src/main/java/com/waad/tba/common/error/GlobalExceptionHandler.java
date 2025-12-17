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

import com.waad.tba.common.exception.ResourceNotFoundException;

import jakarta.servlet.http.HttpServletRequest;

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

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        String trackingId = generateTrackingId();
        String path = request.getRequestURI();
        
        log.warn("Resource not found - Path: {}, Message: {}, TrackingId: {}", path, ex.getMessage(), trackingId);
        
        ErrorCode code;
        if (path.contains("/claims")) code = ErrorCode.CLAIM_NOT_FOUND;
        else if (path.contains("/admin/users")) code = ErrorCode.USER_NOT_FOUND;
        else if (path.contains("/employers")) code = ErrorCode.EMPLOYER_NOT_FOUND;
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

