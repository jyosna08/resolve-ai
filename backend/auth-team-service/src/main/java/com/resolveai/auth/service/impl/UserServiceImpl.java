package com.resolveai.auth.service.impl;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.*;
import com.resolveai.auth.exception.ResourceNotFoundException;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class UserServiceImpl implements UserService {
 private static final Logger log=LoggerFactory.getLogger(UserServiceImpl.class);
 private final UserRepository users;
 public UserServiceImpl(UserRepository users) { this.users=users; }
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
