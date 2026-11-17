package com.resolveai.notification.dto;
import com.resolveai.notification.enums.AlertType;
import java.time.LocalDateTime;
public record AlertResponse(Long id,Long ticketId,String ticketTitle,AlertType alertType,String message,boolean acknowledged,LocalDateTime slaDeadline,LocalDateTime createdAt) { }
