package com.resolveai.auth.service.impl;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.exception.InvalidCredentialsException;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.exception.*;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.security.JwtService;
import com.resolveai.auth.service.UserService;
import com.resolveai.auth.service.AuthService;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AuthServiceImpl implements AuthService {
 private static final Logger log=LoggerFactory.getLogger(AuthServiceImpl.class);
 private final UserRepository users; private final org.springframework.security.crypto.password.PasswordEncoder encoder; private final JwtService jwt; private final UserService userService;
 public AuthServiceImpl(UserRepository users,org.springframework.security.crypto.password.PasswordEncoder encoder,JwtService jwt,UserService userService) { this.users=users; this.encoder=encoder; this.jwt=jwt; this.userService=userService; }
 @Override @Transactional public UserResponse register(RegisterRequest r) { return userService.registerCustomer(r); }
 @Override @Transactional(readOnly=true) public LoginResponse login(LoginRequest r) {
  User u=users.findByEmail(normalize(r.email())).orElseThrow(InvalidCredentialsException::new);
  if(!encoder.matches(r.password(),u.getPasswordHash())) throw new InvalidCredentialsException();
  log.info("User logged in id={}",u.getId()); return new LoginResponse(jwt.generateToken(u),u.getId(),u.getFullName(),u.getRole());
 }
 private String normalize(String email) { return email.trim().toLowerCase(Locale.ROOT); }
}
