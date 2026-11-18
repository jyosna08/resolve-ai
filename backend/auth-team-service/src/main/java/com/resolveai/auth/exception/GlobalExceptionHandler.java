package com.resolveai.auth.exception;
import com.resolveai.auth.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
@RestControllerAdvice
public class GlobalExceptionHandler {
 private static final Logger log=LoggerFactory.getLogger(GlobalExceptionHandler.class);
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException ex,HttpServletRequest req) {
  String msg=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+": "+e.getDefaultMessage()).collect(Collectors.joining(", ")); return response(HttpStatus.BAD_REQUEST,msg,req);
 }
 @ExceptionHandler({MethodArgumentTypeMismatchException.class,HttpMessageNotReadableException.class,IllegalArgumentException.class})
 public ResponseEntity<ErrorResponse> badRequest(Exception ex,HttpServletRequest req) { return response(HttpStatus.BAD_REQUEST,"Invalid request value",req); }
 @ExceptionHandler(DuplicateEmailException.class) public ResponseEntity<ErrorResponse> duplicate(RuntimeException ex,HttpServletRequest req) { return response(HttpStatus.CONFLICT,ex.getMessage(),req); }
 @ExceptionHandler(ForbiddenOperationException.class) public ResponseEntity<ErrorResponse> forbidden(ForbiddenOperationException ex,HttpServletRequest req) { return response(HttpStatus.FORBIDDEN,ex.getMessage(),req); }
 @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class) public ResponseEntity<ErrorResponse> accessDenied(org.springframework.security.access.AccessDeniedException ex,HttpServletRequest req) { return response(HttpStatus.FORBIDDEN,"Access denied",req); }
 @ExceptionHandler(InvalidCredentialsException.class) public ResponseEntity<ErrorResponse> credentials(RuntimeException ex,HttpServletRequest req) { return response(HttpStatus.UNAUTHORIZED,ex.getMessage(),req); }
 @ExceptionHandler(ResourceNotFoundException.class) public ResponseEntity<ErrorResponse> missing(RuntimeException ex,HttpServletRequest req) { return response(HttpStatus.NOT_FOUND,ex.getMessage(),req); }
 @ExceptionHandler(Exception.class) public ResponseEntity<ErrorResponse> unexpected(Exception ex,HttpServletRequest req) { log.error("Unhandled request error",ex); return response(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected error occurred",req); }
 private ResponseEntity<ErrorResponse> response(HttpStatus s,String message,HttpServletRequest req) { return ResponseEntity.status(s).body(new ErrorResponse(LocalDateTime.now(),s.value(),s.getReasonPhrase(),message,req.getRequestURI())); }
}
