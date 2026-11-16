package com.resolveai.auth.controller;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @Tag(name="Authentication")
public class AuthController {
 private final AuthService auth;
 public AuthController(AuthService auth) { this.auth=auth; }
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) @Operation(summary="Register an account") public UserResponse register(@Valid @RequestBody RegisterRequest req) { return auth.register(req); }
 @PostMapping("/login") @Operation(summary="Log in") public LoginResponse login(@Valid @RequestBody LoginRequest req) { return auth.login(req); }
}
