package com.resolveai.ai.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
public class JwtService {
 private final SecretKey key;
 public JwtService(@Value("${app.jwt.secret}") String secret) {
  byte[] bytes=secret.getBytes(StandardCharsets.UTF_8); if(bytes.length<32) throw new IllegalStateException("JWT secret must be at least 32 bytes"); key=Keys.hmacShaKeyFor(bytes);
 }
 public Claims parse(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
 public boolean isValid(String token) { try { parse(token);return true; } catch(JwtException|IllegalArgumentException ex) { return false; } }
}
