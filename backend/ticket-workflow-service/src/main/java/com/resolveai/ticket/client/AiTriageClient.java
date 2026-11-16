package com.resolveai.ticket.client;
import com.resolveai.ticket.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
@FeignClient(name="ai-triage-service")
public interface AiTriageClient { @PostMapping("/api/ai/analyze") TriageResult analyze(@RequestBody AnalyzeRequest request); }
