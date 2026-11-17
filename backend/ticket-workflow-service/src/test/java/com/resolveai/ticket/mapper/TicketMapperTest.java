package com.resolveai.ticket.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.resolveai.ticket.dto.TicketResponse;
import com.resolveai.ticket.entity.Ticket;
import com.resolveai.ticket.enums.Category;
import com.resolveai.ticket.enums.Priority;
import com.resolveai.ticket.enums.Sentiment;
import com.resolveai.ticket.enums.TicketStatus;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class TicketMapperTest {
    private final Ticket ticket = ticket();

    @Test
    void redactsCustomerPrivateFieldsAndPreservesPublicFields() {
        TicketResponse response = TicketMapper.toResponseFor(ticket, "CUSTOMER");

        assertThat(response.aiSummary()).isNull();
        assertThat(response.aiDraftReply()).isNull();
        assertThat(response.sentiment()).isNull();
        assertThat(response.slaDeadline()).isNull();
        assertThat(response.assignedAgentId()).isNull();
        assertThat(response.assignedAgentName()).isNull();
        assertThat(response.priority()).isEqualTo(Priority.CRITICAL);
        assertThat(response.category()).isEqualTo(Category.BILLING);
        assertThat(response.status()).isEqualTo(TicketStatus.TO_DO);
    }

    @Test
    void leavesAgentAndAdminResponsesUntouched() {
        assertComplete(TicketMapper.toResponseFor(ticket, "AGENT"));
        assertComplete(TicketMapper.toResponseFor(ticket, "ADMIN"));
    }

    private void assertComplete(TicketResponse response) {
        assertThat(response.aiSummary()).isEqualTo("Private summary");
        assertThat(response.aiDraftReply()).isEqualTo("Private draft");
        assertThat(response.sentiment()).isEqualTo(Sentiment.FRUSTRATED);
        assertThat(response.slaDeadline()).isEqualTo(ticket.getSlaDeadline());
        assertThat(response.assignedAgentId()).isEqualTo(17L);
        assertThat(response.assignedAgentName()).isEqualTo("Assigned Agent");
        assertThat(response.priority()).isEqualTo(Priority.CRITICAL);
        assertThat(response.category()).isEqualTo(Category.BILLING);
        assertThat(response.status()).isEqualTo(TicketStatus.TO_DO);
    }

    private static Ticket ticket() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setTitle("Payment issue");
        ticket.setDescription("Payment processing is unavailable.");
        ticket.setStatus(TicketStatus.TO_DO);
        ticket.setPriority(Priority.CRITICAL);
        ticket.setCategory(Category.BILLING);
        ticket.setSentiment(Sentiment.FRUSTRATED);
        ticket.setAiSummary("Private summary");
        ticket.setAiDraftReply("Private draft");
        ticket.setReporterId(8L);
        ticket.setAssignedAgentId(17L);
        ticket.setAssignedAgentName("Assigned Agent");
        ticket.setSlaDeadline(LocalDateTime.of(2026, 11, 18, 12, 0));
        ticket.setCreatedAt(LocalDateTime.of(2026, 11, 17, 12, 0));
        return ticket;
    }
}
