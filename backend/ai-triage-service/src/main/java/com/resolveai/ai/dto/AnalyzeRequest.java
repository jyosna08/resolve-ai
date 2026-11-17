package com.resolveai.ai.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record AnalyzeRequest(@NotBlank @Size(min=5,max=200) String title,@NotBlank @Size(min=10,max=2000) String description) { }
