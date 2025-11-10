package fr.fst.forumstages.backend.config;

import fr.fst.forumstages.backend.error.dto.ErrorResponseDto;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponseDto> handleNoSuchElementException(NoSuchElementException ex) {
        return handleException(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicateKeyException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponseDto> duplicateKeyException(DuplicateKeyException ex) {
        return handleException(HttpStatus.CONFLICT, ex.getMessage());
    }

    private ResponseEntity<ErrorResponseDto> handleException(HttpStatus status, String message) {
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                status.value(),
                status.getReasonPhrase(),
                message
        );
        return new ResponseEntity<>(
                errorResponse,
                status
        );
    }
}
