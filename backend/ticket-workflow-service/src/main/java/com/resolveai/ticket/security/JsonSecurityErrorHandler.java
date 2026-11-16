package com.resolveai.ticket.security;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ticket.dto.ErrorResponse;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.LocalDateTime;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
@Component
public class JsonSecurityErrorHandler implements AuthenticationEntryPoint,AccessDeniedHandler {
 private final ObjectMapper mapper;
 public JsonSecurityErrorHandler(ObjectMapper mapper){this.mapper=mapper;}
 @Override public void commence(HttpServletRequest req,HttpServletResponse res,AuthenticationException ex)throws IOException{write(req,res,401,"Unauthorized","Authentication required");}
 @Override public void handle(HttpServletRequest req,HttpServletResponse res,org.springframework.security.access.AccessDeniedException ex)throws IOException{write(req,res,403,"Forbidden","Access denied");}
 private void write(HttpServletRequest req,HttpServletResponse res,int status,String error,String message)throws IOException{res.setStatus(status);res.setContentType("application/json");mapper.writeValue(res.getOutputStream(),new ErrorResponse(LocalDateTime.now(),status,error,message,req.getRequestURI()));}
}
