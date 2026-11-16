package com.resolveai.ai.controller;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.client.GeminiClient;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") class AiControllerIntegrationTest {
 private static final String SECRET="resolveai-test-jwt-secret-at-least-32-bytes-long";
 @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @MockBean GeminiClient gemini;
 @Test void validJwtReturnsExactlyFiveContractFields() throws Exception {
  when(gemini.generate(anyString())).thenReturn(java.util.Optional.of("{\"category\":\"BILLING\",\"priority\":\"CRITICAL\",\"sentiment\":\"FRUSTRATED\",\"summary\":\"Payment blocked\",\"draftReply\":\"We are reviewing this.\"}"));
  String result=mvc.perform(post("/api/ai/analyze").header("Authorization","Bearer "+token()).contentType(MediaType.APPLICATION_JSON).content(validBody())).andExpect(status().isOk()).andExpect(jsonPath("$.priority").value("CRITICAL")).andReturn().getResponse().getContentAsString();
  JsonNode json=mapper.readTree(result);Set<String> fields=new java.util.HashSet<>();json.fieldNames().forEachRemaining(fields::add);assertThat(fields).containsExactlyInAnyOrder("category","priority","sentiment","summary","draftReply");
 }
 @Test void missingAndTamperedTokensReturnStandard401() throws Exception {
  mvc.perform(post("/api/ai/analyze").contentType(MediaType.APPLICATION_JSON).content(validBody())).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.error").value("Unauthorized")).andExpect(jsonPath("$.message").value("Authentication required"));
  String token=token();mvc.perform(post("/api/ai/analyze").header("Authorization","Bearer "+token.substring(0,token.length()-2)+"xx").contentType(MediaType.APPLICATION_JSON).content(validBody())).andExpect(status().isUnauthorized());
 }
 @Test void invalidPayloadsReturn400() throws Exception {
  String valid=token();
  mvc.perform(post("/api/ai/analyze").header("Authorization","Bearer "+valid).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"tiny\",\"description\":\"long enough description\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/ai/analyze").header("Authorization","Bearer "+valid).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Valid title\",\"description\":\"short\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/ai/analyze").header("Authorization","Bearer "+valid).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\" \",\"description\":\" \"}")).andExpect(status().isBadRequest());
 }
 @Test void geminiUnavailableStillReturns200Fallback() throws Exception {
  when(gemini.generate(anyString())).thenReturn(java.util.Optional.empty());
  mvc.perform(post("/api/ai/analyze").header("Authorization","Bearer "+token()).contentType(MediaType.APPLICATION_JSON).content(validBody())).andExpect(status().isOk()).andExpect(jsonPath("$.category").value("GENERAL")).andExpect(jsonPath("$.priority").value("MEDIUM")).andExpect(jsonPath("$.sentiment").value("NEUTRAL"));
 }
 private String validBody(){return "{\"title\":\"Payment failure\",\"description\":\"Payment checkout is blocked after submitting the card\"}";}
 private String token(){var now=new Date();return Jwts.builder().subject("42").claim("email","test@example.com").claim("role","CUSTOMER").claim("fullName","Test User").issuedAt(now).expiration(new Date(now.getTime()+60000)).signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();}
}
