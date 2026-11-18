package com.resolveai.auth.config;

import com.resolveai.auth.enums.Role;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapRunnerTest {
    @Mock UserRepository users;
    @Mock UserService userService;
    Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
    AdminBootstrapRunner runner;

    @BeforeEach void setup() {
        runner = new AdminBootstrapRunner(new BootstrapAdminProperties(" Platform Admin ", " ADMIN@EXAMPLE.COM ", "Password123"), users, userService, validator);
    }

    @Test void emptyCredentialsSkipBootstrap() {
        runner = new AdminBootstrapRunner(new BootstrapAdminProperties("Admin", "", ""), users, userService, validator);
        runner.run(new DefaultApplicationArguments());
        verifyNoInteractions(users, userService);
    }

    @Test void existingAdminMakesBootstrapIdempotent() {
        when(users.existsByRole(Role.ADMIN)).thenReturn(true);
        runner.run(new DefaultApplicationArguments());
        verify(users, never()).existsByEmail(anyString());
        verifyNoInteractions(userService);
    }

    @Test void createsNormalizedAdminThroughUserService() {
        when(users.existsByRole(Role.ADMIN)).thenReturn(false);
        when(users.existsByEmail("admin@example.com")).thenReturn(false);
        runner.run(new DefaultApplicationArguments());
        verify(userService).createBootstrapAdmin("Platform Admin", "admin@example.com", "Password123");
    }

    @Test void invalidEmailOrShortPasswordSkipsCreation() {
        runner = new AdminBootstrapRunner(new BootstrapAdminProperties("Admin", "bad", "short"), users, userService, validator);
        runner.run(new DefaultApplicationArguments());
        verify(users).existsByRole(Role.ADMIN);
        verifyNoInteractions(userService);
        runner = new AdminBootstrapRunner(new BootstrapAdminProperties("Admin", "admin@example.com", "short"), users, userService, validator);
        when(users.existsByRole(Role.ADMIN)).thenReturn(false);
        runner.run(new DefaultApplicationArguments());
        verify(users, never()).existsByEmail(anyString());
        verifyNoInteractions(userService);
    }

    @Test void occupiedEmailSkipsCreationAndFailuresDoNotEscape() {
        when(users.existsByRole(Role.ADMIN)).thenReturn(false);
        when(users.existsByEmail("admin@example.com")).thenReturn(true);
        runner.run(new DefaultApplicationArguments());
        verifyNoInteractions(userService);
        when(users.existsByEmail("admin@example.com")).thenThrow(new IllegalStateException("database issue"));
        runner.run(new DefaultApplicationArguments());
    }
}
