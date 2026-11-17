package com.resolveai.ticket.mapper;

import com.resolveai.ticket.dto.CommentResponse;
import com.resolveai.ticket.dto.TicketResponse;
import com.resolveai.ticket.entity.Ticket;
import com.resolveai.ticket.entity.TicketComment;

public final class TicketMapper {
    private static final String CUSTOMER_ROLE = "CUSTOMER";

    private TicketMapper() { }

    public static TicketResponse toResponseFor(Ticket ticket, String role) {
        boolean redact = CUSTOMER_ROLE.equalsIgnoreCase(role);
        return new TicketResponse(
                ticket.getId(), ticket.getTitle(), ticket.getDescription(), ticket.getStatus(),
                ticket.getPriority(), ticket.getCategory(),
                redact ? null : ticket.getSentiment(),
                redact ? null : ticket.getAiSummary(),
                redact ? null : ticket.getAiDraftReply(),
                ticket.getReporterId(),
                redact ? null : ticket.getAssignedAgentId(),
                redact ? null : ticket.getAssignedAgentName(),
                redact ? null : ticket.getSlaDeadline(), ticket.getCreatedAt());
    }

    public static CommentResponse toResponse(TicketComment comment) {
        return new CommentResponse(comment.getId(), comment.getAuthorName(), comment.getMessage(),
                comment.isAiVerified(), comment.getCreatedAt());
    }
}
