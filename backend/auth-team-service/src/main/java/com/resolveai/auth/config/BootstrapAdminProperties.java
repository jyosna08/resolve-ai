package com.resolveai.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import jakarta.validation.constraints.Email;

@ConfigurationProperties(prefix = "app.bootstrap-admin")
public record BootstrapAdminProperties(String name, @Email String email, String password) {
}
