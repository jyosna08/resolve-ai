package com.resolveai.ai.config;
import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
@Configuration
public class GeminiClientConfiguration {
 @Bean RestClient geminiRestClientTemplate(RestClient.Builder builder,GeminiProperties properties) {
  HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofMillis(properties.connectTimeoutMs())).build();
  JdkClientHttpRequestFactory factory=new JdkClientHttpRequestFactory(client);
  factory.setReadTimeout(Duration.ofMillis(properties.readTimeoutMs()));
  return builder.requestFactory(factory).build();
 }
}
