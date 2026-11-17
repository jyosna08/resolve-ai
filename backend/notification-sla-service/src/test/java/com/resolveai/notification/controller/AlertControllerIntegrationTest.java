package com.resolveai.notification.controller;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.notification.repository.SlaAlertRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") class AlertControllerIntegrationTest {
 private static final String SECRET="notification-test-jwt-secret-32-bytes-minimum";
 @Autowired MockMvc mvc;@Autowired ObjectMapper mapper;@Autowired SlaAlertRepository alerts;
 @BeforeEach void reset(){alerts.deleteAll();}
 @Test void eventIngestIsIdempotentAndRequiresAuthentication()throws Exception{
  String body=eventBody();String agent=token("AGENT");String first=mvc.perform(post("/api/notifications/events/critical").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
  JsonNode firstJson=mapper.readTree(first);String second=mvc.perform(post("/api/notifications/events/critical").header("Authorization","Bearer "+token("CUSTOMER")).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();assertThat(mapper.readTree(second).get("id").asLong()).isEqualTo(firstJson.get("id").asLong());
  mvc.perform(post("/api/notifications/events/critical").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content("{} ")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/notifications/events/critical").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
 }
 @Test void alertsAndAcknowledgeEnforceRoleAndNotFound()throws Exception{
  String body=eventBody();mvc.perform(post("/api/notifications/events/critical").header("Authorization","Bearer "+token("CUSTOMER")).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated());
  String agent=token("AGENT");mvc.perform(get("/api/notifications/alerts").header("Authorization","Bearer "+agent)).andExpect(status().isOk()).andExpect(jsonPath("$",org.hamcrest.Matchers.hasSize(1)));
  mvc.perform(get("/api/notifications/alerts").header("Authorization","Bearer "+token("CUSTOMER"))).andExpect(status().isForbidden());mvc.perform(get("/api/notifications/alerts")).andExpect(status().isUnauthorized());
  mvc.perform(patch("/api/notifications/alerts/1/acknowledge").header("Authorization","Bearer "+agent)).andExpect(status().isOk()).andExpect(jsonPath("$.acknowledged").value(true));
  mvc.perform(get("/api/notifications/alerts").header("Authorization","Bearer "+agent)).andExpect(status().isOk()).andExpect(jsonPath("$",org.hamcrest.Matchers.hasSize(0)));
  mvc.perform(patch("/api/notifications/alerts/999/acknowledge").header("Authorization","Bearer "+agent)).andExpect(status().isNotFound());mvc.perform(patch("/api/notifications/alerts/1/acknowledge").header("Authorization","Bearer "+token("CUSTOMER"))).andExpect(status().isForbidden());
 }
 private String eventBody(){return "{\"ticketId\":101,\"title\":\"Payment Gateway Failure\",\"priority\":\"CRITICAL\",\"assignedAgentName\":\"Priya Sharma\",\"slaDeadline\":\""+LocalDateTime.now().plusHours(24)+"\"}";}
 private String token(String role){Date now=new Date();return Jwts.builder().subject("21").claim("email","user@example.com").claim("role",role).claim("fullName","Test User").issuedAt(now).expiration(new Date(now.getTime()+60000)).signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();}
}
