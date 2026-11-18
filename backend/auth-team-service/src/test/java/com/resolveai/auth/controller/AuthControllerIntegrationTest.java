package com.resolveai.auth.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.Department;
import com.resolveai.auth.enums.Role;
import com.resolveai.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;

    @BeforeEach void clearUsers() { users.deleteAll(); }

    @Test void publicRegistrationCreatesOnlyCustomersAndRejectsPrivilegedRoles() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Priya Sharma\",\"email\":\"PRIYA@EXAMPLE.COM\",\"password\":\"Password@123\",\"department\":\"TECHNICAL\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("priya@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER")).andExpect(jsonPath("$.department").value("GENERAL"))
                .andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Explicit Customer\",\"email\":\"explicit@example.com\",\"password\":\"Password@123\",\"role\":\"CUSTOMER\",\"department\":\"BILLING\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.department").value("GENERAL"));
        for (String role : new String[]{"AGENT", "ADMIN"}) {
            mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"fullName\":\"Blocked\",\"email\":\"blocked"+role+"@example.com\",\"password\":\"Password@123\",\"role\":\""+role+"\"}"))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value("Only administrators can create agent or admin accounts"));
        }
        org.assertj.core.api.Assertions.assertThat(users.count()).isEqualTo(2);
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Duplicate\",\"email\":\"priya@example.com\",\"password\":\"Password@123\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"x\",\"email\":\"bad\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test void adminCreatesTeamUsersAndOtherRolesCannot() throws Exception {
        String adminToken = seedAndLogin("admin@example.com", Role.ADMIN);
        String agentJson = "{\"fullName\":\"Priya Agent\",\"email\":\"AGENT@EXAMPLE.COM\",\"password\":\"Password@123\",\"role\":\"AGENT\",\"department\":\"BILLING\"}";
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(agentJson))
                .andExpect(status().isUnauthorized());
        var created = mvc.perform(post("/api/users").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(agentJson))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("agent@example.com"))
                .andExpect(jsonPath("$.role").value("AGENT")).andExpect(jsonPath("$.department").value("BILLING"))
                .andExpect(jsonPath("$.password").doesNotExist()).andReturn().getResponse().getContentAsString();
        long agentId = mapper.readTree(created).get("id").asLong();
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(agentJson))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"Additional Admin\",\"email\":\"other-admin@example.com\",\"password\":\"Password@123\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.department").value("GENERAL"));
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"x\",\"email\":\"bad\",\"password\":\"short\",\"role\":\"AGENT\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"Missing Role\",\"email\":\"missing-role@example.com\",\"password\":\"Password@123\"}"))
                .andExpect(status().isBadRequest());
        String agentToken = login("agent@example.com", "Password@123");
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + agentToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"Extra Agent\",\"email\":\"extra@example.com\",\"password\":\"Password@123\",\"role\":\"AGENT\"}"))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Test Customer\",\"email\":\"customer@example.com\",\"password\":\"Password@123\"}"))
                .andExpect(status().isCreated());
        String customerToken = login("customer@example.com", "Password@123");
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(agentJson))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/users/agents/least-loaded?department=BILLING").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(agentId)).andExpect(jsonPath("$.activeTicketCount").value(0));
        mvc.perform(patch("/api/users/" + agentId + "/workload/increment").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(1));
        mvc.perform(patch("/api/users/" + agentId + "/workload/increment").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(2));
        mvc.perform(patch("/api/users/" + agentId + "/workload/decrement").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(1));
        mvc.perform(patch("/api/users/" + agentId + "/workload/decrement").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(0));
        mvc.perform(patch("/api/users/" + agentId + "/workload/decrement").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeTicketCount").value(0));
    }

    private String seedAndLogin(String email, Role role) throws Exception {
        User user = new User(); user.setFullName("Test " + role); user.setEmail(email);
        user.setPasswordHash(encoder.encode("Password@123")); user.setRole(role); user.setDepartment(Department.GENERAL);
        users.save(user);
        return login(email, "Password@123");
    }

    private String login(String email, String password) throws Exception {
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(response);
        return node.get("token").asText();
    }
}
