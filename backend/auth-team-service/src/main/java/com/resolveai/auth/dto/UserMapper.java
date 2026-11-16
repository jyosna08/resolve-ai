package com.resolveai.auth.dto;
import com.resolveai.auth.entity.User;
public final class UserMapper {
 private UserMapper() { }
 public static UserResponse response(User u) { return new UserResponse(u.getId(),u.getFullName(),u.getEmail(),u.getRole(),u.getDepartment()); }
 public static AgentWorkloadResponse workload(User u) { return new AgentWorkloadResponse(u.getId(),u.getFullName(),u.getActiveTicketCount()); }
}
