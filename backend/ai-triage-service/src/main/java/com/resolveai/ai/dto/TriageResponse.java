package com.resolveai.ai.dto;
import com.resolveai.ai.enums.*;
public record TriageResponse(Category category,Priority priority,Sentiment sentiment,String summary,String draftReply) { }
