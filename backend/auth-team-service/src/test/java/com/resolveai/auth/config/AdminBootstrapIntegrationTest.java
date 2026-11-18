package com.resolveai.auth.config;

import com.resolveai.auth.enums.Role;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.service.AuthService;
import com.resolveai.auth.dto.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:auth_bootstrap_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "app.bootstrap-admin.name=Platform Admin",
        "app.bootstrap-admin.email= ADMIN@EXAMPLE.COM ",
        "app.bootstrap-admin.password=Password@123"
})
@ActiveProfiles("test")
class AdminBootstrapIntegrationTest {
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired AuthService auth;
    @Autowired AdminBootstrapRunner runner;

    @Test void createsLoggableAdminAndRepeatedRunIsIdempotent() {
        var admin = users.findByEmail("admin@example.com").orElseThrow();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.getDepartment().name()).isEqualTo("GENERAL");
        assertThat(encoder.matches("Password@123", admin.getPasswordHash())).isTrue();
        assertThat(auth.login(new LoginRequest("ADMIN@EXAMPLE.COM", "Password@123")).token()).isNotBlank();

        runner.run(new DefaultApplicationArguments());

        assertThat(users.count()).isEqualTo(1);
        assertThat(users.existsByRole(Role.ADMIN)).isTrue();
    }
}
