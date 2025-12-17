package com.waad.tba.common.error;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Standard set of application error codes")
public enum ErrorCode {
    USER_NOT_FOUND,
    INVALID_CREDENTIALS,
    TOKEN_EXPIRED,
    ACCESS_DENIED,
    CLAIM_NOT_FOUND,
    MEMBER_ALREADY_EXISTS,
    EMPLOYER_NOT_FOUND,
    VALIDATION_ERROR,
    INTERNAL_ERROR
}

