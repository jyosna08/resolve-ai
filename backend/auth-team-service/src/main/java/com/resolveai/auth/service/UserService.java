package com.resolveai.auth.service;
import com.resolveai.auth.dto.AgentWorkloadResponse;
import com.resolveai.auth.dto.CreateUserRequest;
import com.resolveai.auth.dto.RegisterRequest;
import com.resolveai.auth.dto.UserResponse;
import com.resolveai.auth.enums.Department;
public interface UserService {
 AgentWorkloadResponse findLeastLoadedAgent(Department department);
 AgentWorkloadResponse incrementWorkload(Long id);
 AgentWorkloadResponse decrementWorkload(Long id);
 UserResponse registerCustomer(RegisterRequest request);
 UserResponse createUser(CreateUserRequest request);
 UserResponse createBootstrapAdmin(String name, String email, String password);
}
