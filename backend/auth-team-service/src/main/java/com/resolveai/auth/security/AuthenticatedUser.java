package com.resolveai.auth.security;
import com.resolveai.auth.enums.Role;
public record AuthenticatedUser(Long userId,String email,Role role) { }
