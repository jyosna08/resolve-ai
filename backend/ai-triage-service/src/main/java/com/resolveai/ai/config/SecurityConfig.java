package com.resolveai.ai.config;
import com.resolveai.ai.security.*;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
public class SecurityConfig {
 @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthenticationFilter jwt,JsonSecurityErrorHandler errors) throws Exception {
  return http.csrf(c->c.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .exceptionHandling(e->e.authenticationEntryPoint(errors).accessDeniedHandler(errors))
   .authorizeHttpRequests(a->a.requestMatchers("/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**","/actuator/health","/actuator/info").permitAll().anyRequest().authenticated())
   .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();
 }
}
