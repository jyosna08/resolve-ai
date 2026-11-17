package com.resolveai.ticket.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.resolveai.ticket.client.AiTriageClient;
import com.resolveai.ticket.client.AuthClient;
import com.resolveai.ticket.config.SlaProperties;
import com.resolveai.ticket.dto.CreateTicketRequest;
import com.resolveai.ticket.dto.DashboardStatsResponse;
import com.resolveai.ticket.dto.AgentWorkload;
import com.resolveai.ticket.dto.TicketResponse;
import com.resolveai.ticket.dto.TriageResult;
import com.resolveai.ticket.dto.VerifyReplyRequest;
import com.resolveai.ticket.entity.Ticket;
import com.resolveai.ticket.enums.Category;
import com.resolveai.ticket.enums.Priority;
import com.resolveai.ticket.enums.Sentiment;
import com.resolveai.ticket.enums.TicketStatus;
import com.resolveai.ticket.event.CriticalTicketEvent;
import com.resolveai.ticket.event.CriticalTicketEventPublisher;
import com.resolveai.ticket.exception.InvalidStatusTransitionException;
import com.resolveai.ticket.security.AuthenticatedUser;
import com.resolveai.ticket.service.TicketPersistencePort;
import com.resolveai.ticket.service.TicketPersistenceService;
import java.time.Duration;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {
    @Mock AiTriageClient ai;
    @Mock AuthClient auth;
    @Mock TicketPersistencePort persistence;
    @Mock CriticalTicketEventPublisher publisher;
    TicketServiceImpl service;
    private final AuthenticatedUser user = new AuthenticatedUser(8L, "customer@example.com", "CUSTOMER", "Customer Name");

    @BeforeEach
    void setup() {
        service = new TicketServiceImpl(ai, auth, persistence, publisher, new SlaProperties(24, 120));
    }

    @Test
    void customerCreationKeepsFullTicketForPersistenceWorkloadAndCriticalEvent() {
        when(ai.analyze(any())).thenReturn(new TriageResult("billing", "critical", "frustrated", "payment outage", "We are on it"));
        when(auth.leastLoaded("BILLING")).thenReturn(new AgentWorkload(21L, "Priya", 2));
        when(persistence.create(any())).thenAnswer(invocation -> saved((Ticket) invocation.getArgument(0), 101L));

        TicketResponse response = service.createTicket(request("Payment failure"), user);

        assertThat(response.category()).isEqualTo(Category.BILLING);
        assertThat(response.priority()).isEqualTo(Priority.CRITICAL);
        assertThat(response.aiSummary()).isNull();
        assertThat(response.aiDraftReply()).isNull();
        assertThat(response.sentiment()).isNull();
        assertThat(response.slaDeadline()).isNull();
        assertThat(response.assignedAgentId()).isNull();
        assertThat(response.assignedAgentName()).isNull();

        ArgumentCaptor<Ticket> stored = ArgumentCaptor.forClass(Ticket.class);
        verify(persistence).create(stored.capture());
        assertThat(stored.getValue().getAiSummary()).isEqualTo("payment outage");
        assertThat(stored.getValue().getAiDraftReply()).isEqualTo("We are on it");
        assertThat(stored.getValue().getAssignedAgentId()).isEqualTo(21L);
        assertThat(stored.getValue().getAssignedAgentName()).isEqualTo("Priya");
        verify(auth).increment(21L);

        ArgumentCaptor<CriticalTicketEvent> event = ArgumentCaptor.forClass(CriticalTicketEvent.class);
        verify(publisher).publish(event.capture());
        assertThat(event.getValue().assignedAgentName()).isEqualTo("Priya");
        assertThat(event.getValue().slaDeadline()).isNotNull();
    }

    @Test
    void aiFailureUsesFallbackButCreatesTicket() {
        when(ai.analyze(any())).thenThrow(new RuntimeException("unavailable"));
        when(auth.leastLoaded("GENERAL")).thenThrow(new RuntimeException("not found"));
        when(persistence.create(any())).thenAnswer(invocation -> saved((Ticket) invocation.getArgument(0), 1L));

        TicketResponse response = service.createTicket(request("Failed checkout"), user);

        assertThat(response.category()).isEqualTo(Category.GENERAL);
        assertThat(response.priority()).isEqualTo(Priority.MEDIUM);
        assertThat(response.sentiment()).isNull();
        verify(auth, never()).increment(any());
    }

    @Test
    void unknownTriageFieldsDefaultIndependently() {
        when(ai.analyze(any())).thenReturn(new TriageResult("bad", "lowish", "positive", "summary", "reply"));
        when(auth.leastLoaded("GENERAL")).thenReturn(null);
        when(persistence.create(any())).thenAnswer(invocation -> saved((Ticket) invocation.getArgument(0), 1L));

        TicketResponse response = service.createTicket(request("Payment issue"), user);

        assertThat(response.category()).isEqualTo(Category.GENERAL);
        assertThat(response.priority()).isEqualTo(Priority.MEDIUM);
        assertThat(response.sentiment()).isNull();
    }

    @Test
    void agentLookupFailureLeavesTicketUnassigned() {
        when(ai.analyze(any())).thenReturn(new TriageResult("TECHNICAL", "LOW", "NEUTRAL", "s", "r"));
        when(auth.leastLoaded("TECHNICAL")).thenThrow(new RuntimeException("unavailable"));
        when(persistence.create(any())).thenAnswer(invocation -> saved((Ticket) invocation.getArgument(0), 1L));

        TicketResponse response = service.createTicket(request("Broken app"), user);

        assertThat(response.assignedAgentId()).isNull();
        verify(auth, never()).increment(any());
    }

    @Test
    void publisherFailureDoesNotFailButNonCriticalDoesNotPublish() {
        when(ai.analyze(any())).thenReturn(new TriageResult("BILLING", "CRITICAL", "NEUTRAL", "s", "r"));
        when(auth.leastLoaded(anyString())).thenReturn(null);
        when(persistence.create(any())).thenAnswer(invocation -> saved((Ticket) invocation.getArgument(0), 1L));
        doThrow(new RuntimeException("publish failed")).when(publisher).publish(any());

        assertThat(service.createTicket(request("Card outage"), user)).isNotNull();
        verify(publisher).publish(any());
        reset(publisher);
        when(ai.analyze(any())).thenReturn(new TriageResult("BILLING", "MEDIUM", "NEUTRAL", "s", "r"));

        service.createTicket(request("Card question"), user);

        verify(publisher, never()).publish(any());
    }

    @Test
    void statusUpdateDecrementsAndInvalidResolvedTransitionsFail() {
        Ticket ticket = ticket(2L, TicketStatus.RESOLVED, 45L);
        when(persistence.updateStatus(2L, TicketStatus.RESOLVED)).thenReturn(new TicketPersistenceService.Mutation(ticket, 45L));

        TicketResponse response = service.updateStatus(2L, TicketStatus.RESOLVED, agent());

        assertThat(response.aiSummary()).isEqualTo("summary");
        verify(auth).decrement(45L);
        when(persistence.updateStatus(2L, TicketStatus.IN_PROGRESS)).thenThrow(new InvalidStatusTransitionException());
        assertThatThrownBy(() -> service.updateStatus(2L, TicketStatus.IN_PROGRESS, agent()))
                .isInstanceOf(InvalidStatusTransitionException.class);
    }

    @Test
    void verifyReplyAndDashboardDelegateToPersistence() {
        Ticket ticket = ticket(1L, TicketStatus.RESOLVED, 22L);
        when(persistence.verifyReply(eq(1L), any(), eq(user))).thenReturn(new TicketPersistenceService.Mutation(ticket, 22L));

        TicketResponse response = service.verifyReply(1L, new VerifyReplyRequest("Verified reply"), user);

        assertThat(response.aiDraftReply()).isNull();
        verify(auth).decrement(22L);
        when(persistence.stats(user, 120)).thenReturn(new DashboardStatsResponse(5, 2, 3, 1));
        assertThat(service.dashboardStats(user)).isEqualTo(new DashboardStatsResponse(5, 2, 3, 1));
    }

    private CreateTicketRequest request(String title) {
        return new CreateTicketRequest(title, "A sufficiently detailed description of the issue");
    }

    private Ticket saved(Ticket ticket, long id) {
        ticket.setId(id);
        ticket.setCreatedAt(LocalDateTime.now());
        return ticket;
    }

    private Ticket ticket(Long id, TicketStatus status, Long agentId) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setTitle("Title");
        ticket.setDescription("A detailed description");
        ticket.setStatus(status);
        ticket.setPriority(Priority.MEDIUM);
        ticket.setCategory(Category.GENERAL);
        ticket.setSentiment(Sentiment.NEUTRAL);
        ticket.setAiSummary("summary");
        ticket.setAiDraftReply("draft");
        ticket.setReporterId(8L);
        ticket.setAssignedAgentId(agentId);
        ticket.setAssignedAgentName("Agent");
        ticket.setSlaDeadline(LocalDateTime.now().plusHours(24));
        ticket.setCreatedAt(LocalDateTime.now());
        return ticket;
    }

    private AuthenticatedUser agent() {
        return new AuthenticatedUser(3L, "agent@example.com", "AGENT", "Agent");
    }
}
