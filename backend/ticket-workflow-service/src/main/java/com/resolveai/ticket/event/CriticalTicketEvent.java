package com.resolveai.ticket.event;
import com.resolveai.ticket.enums.Priority;
import java.time.LocalDateTime;
public record CriticalTicketEvent(Long ticketId,String title,Priority priority,String assignedAgentName,LocalDateTime slaDeadline) { }
