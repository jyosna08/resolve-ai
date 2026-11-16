package com.resolveai.ticket.dto;
import com.resolveai.ticket.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
public record UpdateStatusRequest(@NotNull TicketStatus status) { }
