package com.resolveai.ticket.client;
import com.resolveai.ticket.enums.Priority;
import java.time.LocalDateTime;
public record CriticalEventPayload(Long ticketId,String title,Priority priority,String assignedAgentName,LocalDateTime slaDeadline) { }
