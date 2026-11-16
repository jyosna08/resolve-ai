package com.resolveai.notification.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
public record CriticalTicketEventRequest(@NotNull Long ticketId,@NotBlank @Size(max=200) String title,String priority,String assignedAgentName,@NotNull LocalDateTime slaDeadline) { }
