package com.resolveai.notification.security;
public record AuthenticatedUser(Long userId,String email,String role,String fullName) { }
