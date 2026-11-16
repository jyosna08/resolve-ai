package com.resolveai.auth.security;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.Role;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
class JwtServiceTest {
 private static final String SECRET="resolveai-unit-test-secret-at-least-32-bytes-long";
 @Test void generatesAndParsesClaims() { User u=user(); var service=new JwtService(SECRET,60000); var claims=service.parseToken(service.generateToken(u)); assertThat(claims.getSubject()).isEqualTo("7"); assertThat(claims.get("email")).isEqualTo("agent@example.com"); }
 @Test void rejectsTamperedToken() { User u=user(); var service=new JwtService(SECRET,60000); String token=service.generateToken(u); assertThat(service.isValid(token.substring(0,token.length()-2)+"xx")).isFalse(); }
 @Test void rejectsExpiredToken() { assertThatThrownBy(()->new JwtService(SECRET,-1000).parseToken(new JwtService(SECRET,-1000).generateToken(user()))).isInstanceOf(JwtException.class); }
 private User user() { User u=new User(); u.setId(7L); u.setEmail("agent@example.com"); u.setFullName("Test Agent"); u.setRole(Role.AGENT); return u; }
}
