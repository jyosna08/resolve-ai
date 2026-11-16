package com.resolveai.auth.dto;
import com.resolveai.auth.enums.Role;
public record LoginResponse(String token,Long userId,String fullName,Role role) { }
