package com.hayat.kutubkhanah_webapp.web.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

/**
 * Turns failures of the backend calls (made from the {@code /api/**} endpoints) into problem details,
 * so the browser gets a clean status code and message instead of a stack trace.
 */
@RestControllerAdvice
class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(RestClientResponseException.class)
    ProblemDetail handleBackendError(RestClientResponseException e) {
        log.warn("Backend call failed with status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
        ProblemDetail detail = ProblemDetail.forStatus(e.getStatusCode());
        detail.setTitle("Backend request failed");
        detail.setDetail(messageFor(e.getStatusCode().value()));
        return detail;
    }

    @ExceptionHandler(ResourceAccessException.class)
    ProblemDetail handleBackendUnavailable(ResourceAccessException e) {
        log.warn("Backend unreachable: {}", e.getMessage());
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.SERVICE_UNAVAILABLE);
        detail.setTitle("Backend unavailable");
        detail.setDetail("The shelf is unreachable right now. Please try again in a moment.");
        return detail;
    }

    private static String messageFor(int status) {
        return switch (status) {
            case 401, 403 -> "Please sign in to continue.";
            case 404 -> "We could not find that on our shelves.";
            case 400 -> "Some of the details were not accepted. Please check and try again.";
            default -> "Something went wrong while talking to the shop. Please try again.";
        };
    }
}
