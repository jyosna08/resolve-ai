package com.resolveai.auth.config;

import com.resolveai.auth.enums.Role;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.service.UserService;
import java.util.Locale;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);
    private final BootstrapAdminProperties properties;
    private final UserRepository users;
    private final UserService userService;
    private final Validator validator;

    public AdminBootstrapRunner(BootstrapAdminProperties properties, UserRepository users, UserService userService, Validator validator) {
        this.properties = properties;
        this.users = users;
        this.userService = userService;
        this.validator = validator;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            String email = properties.email() == null ? "" : properties.email().trim().toLowerCase(Locale.ROOT);
            String password = properties.password();
            if (email.isBlank() || password == null || password.isBlank()) {
                log.info("Bootstrap admin is not configured");
                return;
            }
            if (users.existsByRole(Role.ADMIN)) return;
            if (!validator.validateValue(BootstrapAdminProperties.class, "email", email).isEmpty()) {
                log.warn("Bootstrap admin skipped: invalid email");
                return;
            }
            if (password.length() < 8) {
                log.warn("Bootstrap admin skipped: password must be at least 8 characters");
                return;
            }
            if (users.existsByEmail(email)) {
                log.warn("Bootstrap admin skipped: email belongs to an existing non-admin user ({})", email);
                return;
            }
            String name = properties.name() == null || properties.name().isBlank() ? "Administrator" : properties.name().trim();
            userService.createBootstrapAdmin(name, email, password);
            log.info("Bootstrap admin created: {}", email);
        } catch (Exception ex) {
            log.warn("Bootstrap admin setup failed; application startup will continue ({})", ex.getClass().getSimpleName());
        }
    }
}
