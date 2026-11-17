package com.resolveai.ai.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
@ConfigurationProperties(prefix="gemini")
public record GeminiProperties(String apiKey,String baseUrl,String model,int connectTimeoutMs,int readTimeoutMs,int maxOutputTokens) { }
