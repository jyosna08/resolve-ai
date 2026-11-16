package com.resolveai.ticket.service.impl;
import com.resolveai.ticket.client.*;
import com.resolveai.ticket.config.SlaProperties;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.enums.*;
import com.resolveai.ticket.event.*;
import com.resolveai.ticket.exception.InvalidStatusTransitionException;
import com.resolveai.ticket.security.AuthenticatedUser;
import com.resolveai.ticket.service.TicketPersistencePort;
import com.resolveai.ticket.service.TicketPersistenceService;
import java.time.*;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class) class TicketServiceImplTest {
 @Mock AiTriageClient ai;@Mock AuthClient auth;@Mock TicketPersistencePort persistence;@Mock CriticalTicketEventPublisher publisher;
 TicketServiceImpl service;
 private final AuthenticatedUser user=new AuthenticatedUser(8L,"customer@example.com","CUSTOMER","Customer Name");
 @BeforeEach void setup(){service=new TicketServiceImpl(ai,auth,persistence,publisher,new SlaProperties(24,120));}
 @Test void createsTriageAssignedTicketAndIncrementsWorkload(){when(ai.analyze(any())).thenReturn(new TriageResult("billing","critical","frustrated","payment outage","We are on it"));when(auth.leastLoaded("BILLING")).thenReturn(new AgentWorkload(21L,"Priya",2));when(persistence.create(any())).thenAnswer(i->response((com.resolveai.ticket.entity.Ticket)i.getArgument(0),101L));var result=service.createTicket(request("Payment failure"),user);assertThat(result.category()).isEqualTo(Category.BILLING);assertThat(result.priority()).isEqualTo(Priority.CRITICAL);assertThat(result.assignedAgentId()).isEqualTo(21L);assertThat(result.assignedAgentName()).isEqualTo("Priya");assertThat(Duration.between(LocalDateTime.now(),result.slaDeadline()).toHours()).isBetween(23L,24L);verify(auth).increment(21L);verify(publisher).publish(any(CriticalTicketEvent.class));}
 @Test void aiFailureUsesFallbackButCreatesTicket(){when(ai.analyze(any())).thenThrow(new RuntimeException("unavailable"));when(auth.leastLoaded("GENERAL")).thenThrow(new RuntimeException("not found"));when(persistence.create(any())).thenAnswer(i->response((com.resolveai.ticket.entity.Ticket)i.getArgument(0),1L));var r=service.createTicket(request("Failed checkout"),user);assertThat(r.category()).isEqualTo(Category.GENERAL);assertThat(r.priority()).isEqualTo(Priority.MEDIUM);assertThat(r.sentiment()).isEqualTo(Sentiment.NEUTRAL);assertThat(r.aiDraftReply()).contains("Thank you for contacting us");verify(auth,never()).increment(any());}
 @Test void unknownTriageFieldsDefaultIndependently(){when(ai.analyze(any())).thenReturn(new TriageResult("bad","lowish","positive","summary","reply"));when(auth.leastLoaded("GENERAL")).thenReturn(null);when(persistence.create(any())).thenAnswer(i->response((com.resolveai.ticket.entity.Ticket)i.getArgument(0),1L));var r=service.createTicket(request("Payment issue"),user);assertThat(r.category()).isEqualTo(Category.GENERAL);assertThat(r.priority()).isEqualTo(Priority.MEDIUM);assertThat(r.sentiment()).isEqualTo(Sentiment.POSITIVE);}
 @Test void agentLookupFailureLeavesTicketUnassigned(){when(ai.analyze(any())).thenReturn(new TriageResult("TECHNICAL","LOW","NEUTRAL","s","r"));when(auth.leastLoaded("TECHNICAL")).thenThrow(new RuntimeException("unavailable"));when(persistence.create(any())).thenAnswer(i->response((com.resolveai.ticket.entity.Ticket)i.getArgument(0),1L));var r=service.createTicket(request("Broken app"),user);assertThat(r.assignedAgentId()).isNull();verify(auth,never()).increment(any());}
 @Test void criticalPublishesAndPublisherFailureDoesNotFailButNonCriticalDoesNotPublish(){when(ai.analyze(any())).thenReturn(new TriageResult("BILLING","CRITICAL","NEUTRAL","s","r"));when(auth.leastLoaded(anyString())).thenReturn(null);when(persistence.create(any())).thenAnswer(i->response((com.resolveai.ticket.entity.Ticket)i.getArgument(0),1L));doThrow(new RuntimeException("publish failed")).when(publisher).publish(any());assertThat(service.createTicket(request("Card outage"),user)).isNotNull();verify(publisher).publish(any());reset(publisher);when(ai.analyze(any())).thenReturn(new TriageResult("BILLING","MEDIUM","NEUTRAL","s","r"));service.createTicket(request("Card question"),user);verify(publisher,never()).publish(any());}
 @Test void statusUpdateDecrementsAndInvalidResolvedTransitionsFail(){TicketResponse r=ticket(2L,TicketStatus.RESOLVED,45L);when(persistence.updateStatus(2L,TicketStatus.RESOLVED)).thenReturn(new TicketPersistenceService.Mutation(r,45L));assertThat(service.updateStatus(2L,TicketStatus.RESOLVED)).isEqualTo(r);verify(auth).decrement(45L);when(persistence.updateStatus(2L,TicketStatus.IN_PROGRESS)).thenThrow(new InvalidStatusTransitionException());assertThatThrownBy(()->service.updateStatus(2L,TicketStatus.IN_PROGRESS)).isInstanceOf(InvalidStatusTransitionException.class);}
 @Test void verifyReplyAndDashboardDelegateToPersistence(){var response=ticket(1L,TicketStatus.RESOLVED,22L);when(persistence.verifyReply(eq(1L),any(),eq(user))).thenReturn(new TicketPersistenceService.Mutation(response,22L));assertThat(service.verifyReply(1L,new VerifyReplyRequest("Verified reply"),user)).isEqualTo(response);verify(auth).decrement(22L);when(persistence.stats(user,120)).thenReturn(new DashboardStatsResponse(5,2,3,1));assertThat(service.dashboardStats(user)).isEqualTo(new DashboardStatsResponse(5,2,3,1));}
 private CreateTicketRequest request(String title){return new CreateTicketRequest(title,"A sufficiently detailed description of the issue");}
 private TicketResponse response(com.resolveai.ticket.entity.Ticket t,long id){t.setId(id);t.setCreatedAt(LocalDateTime.now());return com.resolveai.ticket.mapper.TicketMapper.toResponse(t);}
 private TicketResponse ticket(Long id,TicketStatus status,Long agent){return new TicketResponse(id,"Title","A detailed description",status,Priority.MEDIUM,Category.GENERAL,Sentiment.NEUTRAL,"summary","draft",8L,agent,"Agent",LocalDateTime.now().plusHours(24),LocalDateTime.now());}
}
