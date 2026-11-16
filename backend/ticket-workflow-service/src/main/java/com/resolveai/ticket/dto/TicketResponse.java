package com.resolveai.ticket.dto;
import com.resolveai.ticket.enums.*;
import java.time.LocalDateTime;
public record TicketResponse(Long id,String title,String description,TicketStatus status,Priority priority,Category category,Sentiment sentiment,String aiSummary,String aiDraftReply,Long reporterId,Long assignedAgentId,String assignedAgentName,LocalDateTime slaDeadline,LocalDateTime createdAt) { }
