package com.resolveai.ticket.dto;
import java.time.LocalDateTime;
public record CommentResponse(Long id,String authorName,String message,boolean aiVerified,LocalDateTime createdAt) { }
