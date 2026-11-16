package com.resolveai.ticket.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
@ConfigurationProperties(prefix="app.sla")
public record SlaProperties(long hours,long warningMinutes) { }
