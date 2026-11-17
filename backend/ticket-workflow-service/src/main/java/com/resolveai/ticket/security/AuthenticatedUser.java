package com.resolveai.ticket.security;
public record AuthenticatedUser(Long userId,String email,String role,String fullName) { }
