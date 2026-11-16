package com.resolveai.ticket.dto;
import jakarta.validation.constraints.*;
public record VerifyReplyRequest(@NotBlank @Size(min=5,max=2000) String replyMessage) { }
