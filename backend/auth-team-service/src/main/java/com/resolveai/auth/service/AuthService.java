package com.resolveai.auth.service;
import com.resolveai.auth.dto.*;
public interface AuthService { UserResponse register(RegisterRequest request); LoginResponse login(LoginRequest request); }
