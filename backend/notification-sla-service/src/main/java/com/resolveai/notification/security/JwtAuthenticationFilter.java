package com.resolveai.notification.security;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtService jwt;
 public JwtAuthenticationFilter(JwtService jwt){this.jwt=jwt;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String header=req.getHeader("Authorization");if(header!=null&&header.startsWith("Bearer "))try{Claims claims=jwt.parse(header.substring(7));String role=claims.get("role",String.class);AuthenticatedUser user=new AuthenticatedUser(Long.valueOf(claims.getSubject()),claims.get("email",String.class),role,claims.get("fullName",String.class));var auth=new UsernamePasswordAuthenticationToken(user,null,List.of(new SimpleGrantedAuthority("ROLE_"+role)));SecurityContextHolder.getContext().setAuthentication(auth);}catch(RuntimeException ex){SecurityContextHolder.clearContext();}chain.doFilter(req,res);
 }
}
