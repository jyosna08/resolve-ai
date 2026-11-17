package com.resolveai.notification.mapper;
import com.resolveai.notification.dto.AlertResponse;
import com.resolveai.notification.entity.SlaAlert;
public final class AlertMapper {
 private AlertMapper() { }
 public static AlertResponse toResponse(SlaAlert a){return new AlertResponse(a.getId(),a.getTicketId(),a.getTicketTitle(),a.getAlertType(),a.getMessage(),a.isAcknowledged(),a.getSlaDeadline(),a.getCreatedAt());}
}
