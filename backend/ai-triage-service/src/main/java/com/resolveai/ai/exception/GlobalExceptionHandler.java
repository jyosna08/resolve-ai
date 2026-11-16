package com.resolveai.ai.exception;
import com.resolveai.ai.dto.ErrorResponse;
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
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<ErrorResponse> invalid(MethodArgumentNotValidException ex,HttpServletRequest req) {
  String message=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+": "+e.getDefaultMessage()).collect(Collectors.joining(", "));
  return response(HttpStatus.BAD_REQUEST,message,req);
 }
 @ExceptionHandler({HttpMessageNotReadableException.class,MethodArgumentTypeMismatchException.class})
 public ResponseEntity<ErrorResponse> unreadable(Exception ex,HttpServletRequest req) { return response(HttpStatus.BAD_REQUEST,"Invalid request body or parameter",req); }
 @ExceptionHandler(Exception.class) public ResponseEntity<ErrorResponse> unexpected(Exception ex,HttpServletRequest req) {
  log.error("Unhandled request error",ex);return response(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected error occurred",req);
 }
 private ResponseEntity<ErrorResponse> response(HttpStatus status,String message,HttpServletRequest req) {
  return ResponseEntity.status(status).body(new ErrorResponse(LocalDateTime.now(),status.value(),status.getReasonPhrase(),message,req.getRequestURI()));
 }
}
