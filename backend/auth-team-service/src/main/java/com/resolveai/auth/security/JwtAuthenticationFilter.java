package com.resolveai.auth.security;
import com.resolveai.auth.enums.Role;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    public JwtAuthenticationFilter(JwtService jwt) { this.jwt=jwt; }
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
        String h=req.getHeader("Authorization");
        if(h!=null && h.startsWith("Bearer ")) try {
            Claims c=jwt.parseToken(h.substring(7)); Role role=Role.valueOf(c.get("role",String.class));
            AuthenticatedUser p=new AuthenticatedUser(Long.valueOf(c.getSubject()),c.get("email",String.class),role);
            var auth=new UsernamePasswordAuthenticationToken(p,null,List.of(new SimpleGrantedAuthority("ROLE_"+role.name())));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch(RuntimeException ignored) { SecurityContextHolder.clearContext(); }
        chain.doFilter(req,res);
    }
}
