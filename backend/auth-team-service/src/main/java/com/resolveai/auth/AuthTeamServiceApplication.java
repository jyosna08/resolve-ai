package com.resolveai.auth;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.resolveai.auth.config.BootstrapAdminProperties;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
@SpringBootApplication(exclude=UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties(BootstrapAdminProperties.class)
public class AuthTeamServiceApplication { public static void main(String[] args) { SpringApplication.run(AuthTeamServiceApplication.class,args); } }
