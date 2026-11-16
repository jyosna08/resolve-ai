package com.resolveai.ticket;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
@SpringBootApplication(exclude=UserDetailsServiceAutoConfiguration.class)
@EnableFeignClients
@ConfigurationPropertiesScan
public class TicketWorkflowServiceApplication {
 public static void main(String[] args) { SpringApplication.run(TicketWorkflowServiceApplication.class,args); }
}
