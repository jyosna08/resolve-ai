package com.resolveai.auth.controller;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.enums.Department;
import com.resolveai.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController @RequestMapping("/api/users") @Tag(name="Team workload")
public class UserController {
 private final UserService users;
 public UserController(UserService users) { this.users=users; }
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')") @Operation(summary="Create a team user") public UserResponse create(@Valid @RequestBody CreateUserRequest request) { return users.createUser(request); }
 @GetMapping("/agents/least-loaded") @Operation(summary="Find the least loaded agent") public AgentWorkloadResponse leastLoaded(@RequestParam Department department) { return users.findLeastLoadedAgent(department); }
 @PatchMapping("/{id}/workload/increment") @Operation(summary="Increment agent workload") public AgentWorkloadResponse increment(@PathVariable Long id) { return users.incrementWorkload(id); }
 @PatchMapping("/{id}/workload/decrement") @Operation(summary="Decrement agent workload") public AgentWorkloadResponse decrement(@PathVariable Long id) { return users.decrementWorkload(id); }
}
