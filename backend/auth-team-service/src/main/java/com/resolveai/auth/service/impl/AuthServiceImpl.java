package com.resolveai.auth.service.impl;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.Department;
import com.resolveai.auth.exception.*;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.security.JwtService;
import com.resolveai.auth.service.AuthService;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AuthServiceImpl implements AuthService {
 private static final Logger log=LoggerFactory.getLogger(AuthServiceImpl.class);
 private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
 public AuthServiceImpl(UserRepository users,PasswordEncoder encoder,JwtService jwt) { this.users=users; this.encoder=encoder; this.jwt=jwt; }
 @Override @Transactional public UserResponse register(RegisterRequest r) {
  String email=normalize(r.email()); if(users.existsByEmail(email)) throw new DuplicateEmailException("Email already exists");
  User u=new User(); u.setFullName(r.fullName().trim()); u.setEmail(email); u.setPasswordHash(encoder.encode(r.password()));
  u.setRole(r.role()); u.setDepartment(r.department()==null?Department.GENERAL:r.department());
  User saved=users.save(u); log.info("Registered user id={} role={}",saved.getId(),saved.getRole()); return UserMapper.response(saved);
 }
 @Override @Transactional(readOnly=true) public LoginResponse login(LoginRequest r) {
  User u=users.findByEmail(normalize(r.email())).orElseThrow(InvalidCredentialsException::new);
  if(!encoder.matches(r.password(),u.getPasswordHash())) throw new InvalidCredentialsException();
  log.info("User logged in id={}",u.getId()); return new LoginResponse(jwt.generateToken(u),u.getId(),u.getFullName(),u.getRole());
 }
 private String normalize(String email) { return email.trim().toLowerCase(Locale.ROOT); }
}
