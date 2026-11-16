package com.resolveai.notification;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
@SpringBootApplication(exclude=UserDetailsServiceAutoConfiguration.class)
public class NotificationSlaServiceApplication {
 public static void main(String[] args){SpringApplication.run(NotificationSlaServiceApplication.class,args);}
}
