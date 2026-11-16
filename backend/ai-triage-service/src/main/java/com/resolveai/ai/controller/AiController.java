package com.resolveai.ai.controller;
import com.resolveai.ai.dto.*;
import com.resolveai.ai.service.TriageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/ai") @Tag(name="AI Triage")
public class AiController {
 private final TriageService service;
 public AiController(TriageService service) { this.service=service; }
 @PostMapping("/analyze") @Operation(summary="Analyze a support ticket")
 public TriageResponse analyze(@Valid @RequestBody AnalyzeRequest request) { return service.analyze(request); }
}
