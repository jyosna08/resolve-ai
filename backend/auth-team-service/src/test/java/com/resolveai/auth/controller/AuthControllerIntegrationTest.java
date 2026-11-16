package com.resolveai.auth.controller;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") class AuthControllerIntegrationTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper mapper;
 @Test void registerLoginAndAuthEndpoints() throws Exception {
  String body="{\"fullName\":\"Priya Sharma\",\"email\":\"PRIYA@EXAMPLE.COM\",\"password\":\"Password@123\",\"role\":\"AGENT\",\"department\":\"TECHNICAL\"}";
  mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("priya@example.com")).andExpect(jsonPath("$.password").doesNotExist());
  mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
  mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"priya@example.com\",\"password\":\"wrong\"}")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("Invalid email or password"));
  String login=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"priya@example.com\",\"password\":\"Password@123\"}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  JsonNode node=mapper.readTree(login); String token=node.get("token").asText();
  mvc.perform(get("/api/users/agents/least-loaded?department=TECHNICAL").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(0));
  mvc.perform(get("/api/users/agents/least-loaded?department=TECHNICAL")).andExpect(status().isUnauthorized());
  mvc.perform(patch("/api/users/1/workload/increment").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(1));
  mvc.perform(patch("/api/users/1/workload/increment").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(2));
  mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body.replace("PRIYA@EXAMPLE.COM","second@example.com").replace("Priya Sharma","Second Agent"))).andExpect(status().isCreated());
  mvc.perform(get("/api/users/agents/least-loaded?department=TECHNICAL").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(2));
  mvc.perform(patch("/api/users/1/workload/decrement").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(1));
  mvc.perform(patch("/api/users/1/workload/decrement").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(0));
  mvc.perform(patch("/api/users/1/workload/decrement").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(0));
 }
 @Test void invalidRegistrationAndUnknownAgentHaveExpectedErrors() throws Exception {
  mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"x\",\"email\":\"bad\",\"password\":\"short\",\"role\":\"AGENT\"}")).andExpect(status().isBadRequest());
 }
}
