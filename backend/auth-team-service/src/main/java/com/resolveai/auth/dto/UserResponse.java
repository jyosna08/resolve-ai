package com.resolveai.auth.dto;
import com.resolveai.auth.enums.*;
public record UserResponse(Long id,String fullName,String email,Role role,Department department) { }
