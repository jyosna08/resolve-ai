package com.resolveai.auth.security;
import com.resolveai.auth.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
public class JwtService {
 private final javax.crypto.SecretKey key; private final long expirationMs;
 public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration-ms}") long expirationMs) {
  byte[] bytes=secret.getBytes(StandardCharsets.UTF_8); if(bytes.length<32) throw new IllegalStateException("JWT secret must be at least 32 bytes");
  this.key=Keys.hmacShaKeyFor(bytes); this.expirationMs=expirationMs;
 }
 public String generateToken(User user) { Date now=new Date(); return Jwts.builder().subject(user.getId().toString()).claim("email",user.getEmail()).claim("role",user.getRole().name()).claim("fullName",user.getFullName()).issuedAt(now).expiration(new Date(now.getTime()+expirationMs)).signWith(key).compact(); }
 public Claims parseToken(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
 public boolean isValid(String token) { try { parseToken(token); return true; } catch(JwtException|IllegalArgumentException ex) { return false; } }
}
