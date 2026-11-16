package com.resolveai.auth.config;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.auth.dto.ErrorResponse;
import com.resolveai.auth.security.JwtAuthenticationFilter;
import java.time.LocalDateTime;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration @EnableMethodSecurity
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthenticationFilter jwt,ObjectMapper mapper) throws Exception {
  http.csrf(c->c.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/api/auth/register","/api/auth/login","/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**","/actuator/health","/actuator/info").permitAll().anyRequest().authenticated())
   .exceptionHandling(e->e.authenticationEntryPoint((q,r,x)->write(mapper,r,HttpStatus.UNAUTHORIZED,"Unauthorized","Authentication required",q.getRequestURI()))
    .accessDeniedHandler((q,r,x)->write(mapper,r,HttpStatus.FORBIDDEN,"Forbidden","Access denied",q.getRequestURI())))
   .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class);
  return http.build();
 }
 private void write(ObjectMapper mapper,jakarta.servlet.http.HttpServletResponse response,HttpStatus status,String error,String message,String path) throws java.io.IOException {
  response.setStatus(status.value()); response.setContentType("application/json");
  mapper.writeValue(response.getOutputStream(),new ErrorResponse(LocalDateTime.now(),status.value(),error,message,path));
 }
}
