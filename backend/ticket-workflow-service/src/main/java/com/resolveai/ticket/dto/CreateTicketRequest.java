package com.resolveai.ticket.dto;
import jakarta.validation.constraints.*;
public record CreateTicketRequest(@NotBlank @Size(min=5,max=200) String title,@NotBlank @Size(min=10,max=2000) String description) { }
