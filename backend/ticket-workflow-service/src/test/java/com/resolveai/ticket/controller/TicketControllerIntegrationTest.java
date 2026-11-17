package com.resolveai.ticket.controller;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ticket.client.*;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.entity.Ticket;
import com.resolveai.ticket.enums.TicketStatus;
import com.resolveai.ticket.repository.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") class TicketControllerIntegrationTest {
 private static final String SECRET="ticket-workflow-test-jwt-secret-32-bytes-minimum";
 @Autowired MockMvc mvc;@Autowired ObjectMapper mapper;@Autowired TicketRepository tickets;@Autowired TicketCommentRepository comments;
 @MockBean AiTriageClient ai;@MockBean AuthClient auth;@MockBean NotificationClient notification;
 @BeforeEach void resetState(){comments.deleteAll();tickets.deleteAll();reset(ai,auth,notification);when(ai.analyze(any())).thenAnswer(inv->{AnalyzeRequest r=inv.getArgument(0);boolean critical=r.title().contains("Critical");String category=r.title().toLowerCase(Locale.ROOT).contains("billing")?"BILLING":"TECHNICAL";return new TriageResult(category,critical?"CRITICAL":"MEDIUM","NEUTRAL","Summary for "+r.title(),"Draft response");});when(auth.leastLoaded(anyString())).thenReturn(new AgentWorkload(99L,"Priya Agent",0));}
 @Test void customerCreatesTicketWithPrivateFieldsRedactedAndPublicFieldsPresent()throws Exception{
  String body=create("Critical billing outage","Checkout payments are failing for customers now",token(1,"CUSTOMER","Customer One"));String response=mvc.perform(post("/api/tickets").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One")).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.title").value("Critical billing outage")).andExpect(jsonPath("$.description").value("Checkout payments are failing for customers now")).andExpect(jsonPath("$.status").value("TO_DO")).andExpect(jsonPath("$.category").value("BILLING")).andExpect(jsonPath("$.priority").value("CRITICAL")).andExpect(jsonPath("$.reporterId").value(1)).andReturn().getResponse().getContentAsString();
  JsonNode json=mapper.readTree(response);assertThat(json.get("id").asLong()).isPositive();assertCustomerPrivateFieldsNull(json);verify(auth).increment(99L);verify(notification).publishCriticalEvent(argThat(event->event.assignedAgentName().equals("Priya Agent")&&event.slaDeadline()!=null));
  long id=json.get("id").asLong();JsonNode listed=mapper.readTree(mvc.perform(get("/api/tickets").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One"))).andReturn().getResponse().getContentAsString()).get(0);assertCustomerPrivateFieldsNull(listed);
  mvc.perform(get("/api/tickets/"+id).header("Authorization","Bearer "+token(3,"AGENT","Agent"))).andExpect(status().isOk()).andExpect(jsonPath("$.aiSummary").value("Summary for Critical billing outage")).andExpect(jsonPath("$.aiDraftReply").value("Draft response")).andExpect(jsonPath("$.sentiment").value("NEUTRAL")).andExpect(jsonPath("$.assignedAgentId").value(99)).andExpect(jsonPath("$.assignedAgentName").value("Priya Agent")).andExpect(jsonPath("$.slaDeadline").isNotEmpty());
  JsonNode agentList=mapper.readTree(mvc.perform(get("/api/tickets").header("Authorization","Bearer "+token(3,"AGENT","Agent"))).andReturn().getResponse().getContentAsString());JsonNode sameTicket=null;for(JsonNode item:agentList){if(item.get("id").asLong()==id)sameTicket=item;}assertThat(sameTicket).isNotNull();assertThat(sameTicket.get("aiSummary").asText()).isEqualTo("Summary for Critical billing outage");assertThat(sameTicket.get("assignedAgentId").asLong()).isEqualTo(99L);assertThat(sameTicket.hasNonNull("slaDeadline")).isTrue();
 }
 @Test void validationAndAuthenticationAreEnforced()throws Exception{
  String customer=token(1,"CUSTOMER","Customer One");mvc.perform(post("/api/tickets").header("Authorization","Bearer "+customer).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"tiny\",\"description\":\"long enough description\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/tickets").header("Authorization","Bearer "+customer).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Valid title\",\"description\":\"short\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(create("Valid title","A long enough ticket description",customer))).andExpect(status().isUnauthorized());
 }
 @Test void customerListIsScopedAndFiltersCombine()throws Exception{
  mvc.perform(post("/api/tickets").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One")).contentType(MediaType.APPLICATION_JSON).content(create("Critical billing Needle","payment checkout error",token(1,"CUSTOMER","Customer One")))).andExpect(status().isCreated());
  mvc.perform(post("/api/tickets").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One")).contentType(MediaType.APPLICATION_JSON).content(create("Different concern","something broken in the application",token(1,"CUSTOMER","Customer One")))).andExpect(status().isCreated());
  mvc.perform(post("/api/tickets").header("Authorization","Bearer "+token(2,"CUSTOMER","Customer Two")).contentType(MediaType.APPLICATION_JSON).content(create("Other customer","private issue for another user",token(2,"CUSTOMER","Customer Two")))).andExpect(status().isCreated());
  mvc.perform(get("/api/tickets").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One"))).andExpect(status().isOk()).andExpect(jsonPath("$",org.hamcrest.Matchers.hasSize(2))).andExpect(jsonPath("$[0].aiSummary").value(org.hamcrest.Matchers.nullValue()));
  mvc.perform(get("/api/tickets").header("Authorization","Bearer "+token(3,"AGENT","Agent"))).andExpect(status().isOk()).andExpect(jsonPath("$",org.hamcrest.Matchers.hasSize(3))).andExpect(jsonPath("$[0].aiSummary").value("Summary for Other customer")).andExpect(jsonPath("$[0].aiDraftReply").value("Draft response")).andExpect(jsonPath("$[0].sentiment").value("NEUTRAL")).andExpect(jsonPath("$[0].assignedAgentId").value(99)).andExpect(jsonPath("$[0].assignedAgentName").value("Priya Agent")).andExpect(jsonPath("$[0].slaDeadline").isNotEmpty());
  mvc.perform(get("/api/tickets?status=TO_DO&priority=CRITICAL&search=needle").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One"))).andExpect(status().isOk()).andExpect(jsonPath("$",org.hamcrest.Matchers.hasSize(1)));
  mvc.perform(get("/api/tickets?status=BAD").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One"))).andExpect(status().isBadRequest());
 }
 @Test void getVisibilityAndMissingTicketResponses()throws Exception{
  String response=mvc.perform(post("/api/tickets").header("Authorization","Bearer "+token(1,"CUSTOMER","Owner")).contentType(MediaType.APPLICATION_JSON).content(create("Owned ticket","Description for owned ticket",token(1,"CUSTOMER","Owner")))).andReturn().getResponse().getContentAsString();long id=mapper.readTree(response).get("id").asLong();
  mvc.perform(get("/api/tickets/"+id).header("Authorization","Bearer "+token(1,"CUSTOMER","Owner"))).andExpect(status().isOk()).andExpect(jsonPath("$.aiSummary").value(org.hamcrest.Matchers.nullValue())).andExpect(jsonPath("$.aiDraftReply").value(org.hamcrest.Matchers.nullValue())).andExpect(jsonPath("$.sentiment").value(org.hamcrest.Matchers.nullValue())).andExpect(jsonPath("$.slaDeadline").value(org.hamcrest.Matchers.nullValue())).andExpect(jsonPath("$.assignedAgentId").value(org.hamcrest.Matchers.nullValue())).andExpect(jsonPath("$.assignedAgentName").value(org.hamcrest.Matchers.nullValue()));mvc.perform(get("/api/tickets/"+id).header("Authorization","Bearer "+token(2,"CUSTOMER","Other"))).andExpect(status().isNotFound());mvc.perform(get("/api/tickets/"+id).header("Authorization","Bearer "+token(3,"AGENT","Agent"))).andExpect(status().isOk()).andExpect(jsonPath("$.aiSummary").value("Summary for Owned ticket")).andExpect(jsonPath("$.aiDraftReply").value("Draft response")).andExpect(jsonPath("$.sentiment").value("NEUTRAL")).andExpect(jsonPath("$.assignedAgentId").value(99)).andExpect(jsonPath("$.assignedAgentName").value("Priya Agent")).andExpect(jsonPath("$.slaDeadline").isNotEmpty());mvc.perform(get("/api/tickets/9999").header("Authorization","Bearer "+token(3,"AGENT","Agent"))).andExpect(status().isNotFound());
 }
 @Test void agentTransitionsResolveAndDecrementWhileCustomerIsForbidden()throws Exception{
  long id=createTicket("Workflow case",1,"CUSTOMER","Customer");String agent=token(3,"AGENT","Priya Agent");
  mvc.perform(patch("/api/tickets/"+id+"/status").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer")).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}")).andExpect(status().isForbidden());
  mvc.perform(patch("/api/tickets/"+id+"/status").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS")).andExpect(jsonPath("$.aiSummary").value("Summary for Workflow case")).andExpect(jsonPath("$.aiDraftReply").value("Draft response")).andExpect(jsonPath("$.sentiment").value("NEUTRAL")).andExpect(jsonPath("$.assignedAgentId").value(99)).andExpect(jsonPath("$.assignedAgentName").value("Priya Agent")).andExpect(jsonPath("$.slaDeadline").isNotEmpty());
  mvc.perform(patch("/api/tickets/"+id+"/status").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"RESOLVED\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("RESOLVED"));verify(auth).decrement(99L);
  mvc.perform(patch("/api/tickets/"+id+"/status").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}")).andExpect(status().isConflict());
 }
 @Test void verifyReplyResolvesSavesVerifiedCommentAndEnforcesRole()throws Exception{
  long id=createTicket("Reply flow",1,"CUSTOMER","Customer");String agent=token(5,"AGENT","Priya Agent");
  mvc.perform(post("/api/tickets/"+id+"/verify-reply").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer")).contentType(MediaType.APPLICATION_JSON).content("{\"replyMessage\":\"Here is a helpful reply\"}")).andExpect(status().isForbidden());
  mvc.perform(post("/api/tickets/"+id+"/verify-reply").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content("{\"replyMessage\":\"We fixed the reported issue\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("RESOLVED")).andExpect(jsonPath("$.aiSummary").value("Summary for Reply flow")).andExpect(jsonPath("$.aiDraftReply").value("Draft response")).andExpect(jsonPath("$.sentiment").value("NEUTRAL")).andExpect(jsonPath("$.assignedAgentId").value(99)).andExpect(jsonPath("$.assignedAgentName").value("Priya Agent")).andExpect(jsonPath("$.slaDeadline").isNotEmpty());
  mvc.perform(get("/api/tickets/"+id+"/comments").header("Authorization","Bearer "+agent)).andExpect(status().isOk()).andExpect(jsonPath("$[0].aiVerified").value(true)).andExpect(jsonPath("$[0].authorName").value("Priya Agent"));verify(auth).decrement(99L);
  mvc.perform(post("/api/tickets/"+id+"/verify-reply").header("Authorization","Bearer "+agent).contentType(MediaType.APPLICATION_JSON).content("{\"replyMessage\":\"Another helpful reply\"}")).andExpect(status().isConflict());
 }
 @Test void dashboardStatsAreScopedAndRouteIsNotShadowed()throws Exception{
  long critical=createTicket("Critical billing outage",1,"CUSTOMER","Customer One");long warning=createTicket("Warning open ticket",1,"CUSTOMER","Customer One");long resolved=createTicket("Resolved today",1,"CUSTOMER","Customer One");long other=createTicket("Critical other customer",2,"CUSTOMER","Customer Two");
  Ticket w=tickets.findById(warning).orElseThrow();w.setSlaDeadline(LocalDateTime.now().plusMinutes(60));tickets.save(w);
  mvc.perform(patch("/api/tickets/"+resolved+"/status").header("Authorization","Bearer "+token(9,"AGENT","Agent")).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"RESOLVED\"}"));
  mvc.perform(get("/api/tickets/dashboard-stats").header("Authorization","Bearer "+token(1,"CUSTOMER","Customer One"))).andExpect(status().isOk()).andExpect(jsonPath("$.totalOpen").value(2)).andExpect(jsonPath("$.criticalAlerts").value(1)).andExpect(jsonPath("$.resolvedToday").value(1)).andExpect(jsonPath("$.slaWarnings").value(1));
  mvc.perform(get("/api/tickets/dashboard-stats").header("Authorization","Bearer "+token(8,"AGENT","Agent"))).andExpect(status().isOk()).andExpect(jsonPath("$.totalOpen").value(3));
 }
 private long createTicket(String title,long userId,String role,String name)throws Exception{String response=mvc.perform(post("/api/tickets").header("Authorization","Bearer "+token(userId,role,name)).contentType(MediaType.APPLICATION_JSON).content(create(title,"A sufficiently detailed ticket description",token(userId,role,name)))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();return mapper.readTree(response).get("id").asLong();}
 private void assertCustomerPrivateFieldsNull(JsonNode json){for(String field:List.of("aiSummary","aiDraftReply","sentiment","slaDeadline","assignedAgentId","assignedAgentName")){assertThat(json.has(field)).as("response contains %s",field).isTrue();assertThat(json.get(field).isNull()).as("%s is null",field).isTrue();}}
 private String create(String title,String description,String ignored){return "{\"title\":\""+title+"\",\"description\":\""+description+"\"}";}
 private String token(long id,String role,String name){Date now=new Date();return Jwts.builder().subject(Long.toString(id)).claim("email","user"+id+"@example.com").claim("role",role).claim("fullName",name).issuedAt(now).expiration(new Date(now.getTime()+60000)).signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();}
}
