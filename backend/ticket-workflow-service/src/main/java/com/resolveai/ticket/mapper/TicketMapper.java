package com.resolveai.ticket.mapper;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.entity.*;
public final class TicketMapper {
 private TicketMapper() { }
 public static TicketResponse toResponse(Ticket t){return new TicketResponse(t.getId(),t.getTitle(),t.getDescription(),t.getStatus(),t.getPriority(),t.getCategory(),t.getSentiment(),t.getAiSummary(),t.getAiDraftReply(),t.getReporterId(),t.getAssignedAgentId(),t.getAssignedAgentName(),t.getSlaDeadline(),t.getCreatedAt());}
 public static CommentResponse toResponse(TicketComment c){return new CommentResponse(c.getId(),c.getAuthorName(),c.getMessage(),c.isAiVerified(),c.getCreatedAt());}
}
