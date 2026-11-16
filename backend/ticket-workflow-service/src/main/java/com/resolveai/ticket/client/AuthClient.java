package com.resolveai.ticket.client;
import com.resolveai.ticket.dto.AgentWorkload;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
@FeignClient(name="auth-team-service")
public interface AuthClient {
 @GetMapping("/api/users/agents/least-loaded") AgentWorkload leastLoaded(@RequestParam("department") String department);
 @PatchMapping("/api/users/{id}/workload/increment") AgentWorkload increment(@PathVariable("id") Long id);
 @PatchMapping("/api/users/{id}/workload/decrement") AgentWorkload decrement(@PathVariable("id") Long id);
}
