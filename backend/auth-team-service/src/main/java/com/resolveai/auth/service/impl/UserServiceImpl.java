package com.resolveai.auth.service.impl;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.*;
import com.resolveai.auth.exception.ResourceNotFoundException;
import com.resolveai.auth.exception.DuplicateEmailException;
import com.resolveai.auth.exception.ForbiddenOperationException;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.service.UserService;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class UserServiceImpl implements UserService {
 private static final Logger log=LoggerFactory.getLogger(UserServiceImpl.class);
 private final UserRepository users;
 private final PasswordEncoder encoder;
 public UserServiceImpl(UserRepository users, PasswordEncoder encoder) { this.users=users; this.encoder=encoder; }
 @Override @Transactional public UserResponse registerCustomer(RegisterRequest request) {
  if(request.role()!=null && request.role()!=Role.CUSTOMER) throw new ForbiddenOperationException("Only administrators can create agent or admin accounts");
  return createUser(request.fullName(),request.email(),request.password(),Role.CUSTOMER,Department.GENERAL);
 }
 @Override @Transactional public UserResponse createUser(CreateUserRequest request) {
  return createUser(request.fullName(),request.email(),request.password(),request.role(),request.department());
 }
 @Override @Transactional public UserResponse createBootstrapAdmin(String name,String email,String password) {
  return createUser(name,email,password,Role.ADMIN,Department.GENERAL);
 }
 private UserResponse createUser(String fullName,String rawEmail,String password,Role role,Department department) {
  String email=rawEmail.trim().toLowerCase(Locale.ROOT);
  if(users.existsByEmail(email)) throw new DuplicateEmailException("Email already exists");
  User user=new User(); user.setFullName(fullName.trim()); user.setEmail(email); user.setPasswordHash(encoder.encode(password));
  user.setRole(role); user.setDepartment(department==null?Department.GENERAL:department);
  User saved=users.save(user); log.info("Created user id={} role={}",saved.getId(),saved.getRole()); return UserMapper.response(saved);
 }
 @Override @Transactional(readOnly=true) public AgentWorkloadResponse findLeastLoadedAgent(Department d) {
  return users.findFirstByRoleAndDepartmentOrderByActiveTicketCountAscIdAsc(Role.AGENT,d).map(UserMapper::workload).orElseThrow(()->new ResourceNotFoundException("No agent available in department "+d));
 }
 @Override @Transactional public AgentWorkloadResponse incrementWorkload(Long id) { return change(id,true); }
 @Override @Transactional public AgentWorkloadResponse decrementWorkload(Long id) { return change(id,false); }
 private AgentWorkloadResponse change(Long id,boolean increment) {
  int rows=increment?users.increment(id):users.decrement(id);
  if(rows==0 && !users.existsById(id)) throw new ResourceNotFoundException("User not found: "+id);
  User u=users.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found: "+id));
  log.info("Updated workload id={} count={}",id,u.getActiveTicketCount()); return UserMapper.workload(u);
 }
}
