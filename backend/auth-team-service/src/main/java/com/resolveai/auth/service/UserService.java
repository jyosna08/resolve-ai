package com.resolveai.auth.service;
import com.resolveai.auth.dto.AgentWorkloadResponse;
import com.resolveai.auth.enums.Department;
public interface UserService { AgentWorkloadResponse findLeastLoadedAgent(Department department); AgentWorkloadResponse incrementWorkload(Long id); AgentWorkloadResponse decrementWorkload(Long id); }
