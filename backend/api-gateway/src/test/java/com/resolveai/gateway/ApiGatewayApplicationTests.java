package com.resolveai.gateway;

import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.core.env.Environment;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ApiGatewayApplicationTests {
    @Autowired RouteDefinitionLocator routes;
    @Autowired Environment environment;
    @Test void contextLoads() { }
    @Test void definesAllRoutesAndCorsOrigin() {
        Set<String> ids = routes.getRouteDefinitions().map(r -> r.getId()).collect(Collectors.toSet()).block();
        assertThat(ids).contains("auth-team-service", "ticket-workflow-service", "ai-triage-service", "notification-sla-service");
        assertThat(environment.getProperty("spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origins",
                environment.getProperty("spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedOrigins", "http://localhost:3000")))
                .contains("http://localhost:3000");
    }
}
