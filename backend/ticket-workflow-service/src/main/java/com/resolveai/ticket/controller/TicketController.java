package com.resolveai.ticket.controller;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.enums.*;
import com.resolveai.ticket.security.AuthenticatedUser;
import com.resolveai.ticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/tickets") @Tag(name="Tickets")
public class TicketController {
 private final TicketService tickets;
 public TicketController(TicketService tickets){this.tickets=tickets;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary="Create and triage a ticket")
 public TicketResponse create(@Valid @RequestBody CreateTicketRequest request,@AuthenticationPrincipal AuthenticatedUser user){return tickets.createTicket(request,user);}
 @GetMapping @Operation(summary="List tickets")
 public List<TicketResponse> list(@RequestParam(required=false) TicketStatus status,@RequestParam(required=false) Priority priority,@RequestParam(required=false) String search,@AuthenticationPrincipal AuthenticatedUser user){return tickets.listTickets(status,priority,search,user);}
 @GetMapping("/dashboard-stats") @Operation(summary="Get dashboard statistics")
 public DashboardStatsResponse stats(@AuthenticationPrincipal AuthenticatedUser user){return tickets.dashboardStats(user);}
 @GetMapping("/{id}") @Operation(summary="Get a ticket") public TicketResponse get(@PathVariable Long id,@AuthenticationPrincipal AuthenticatedUser user){return tickets.getTicket(id,user);}
 @GetMapping("/{id}/comments") @Operation(summary="List ticket comments") public List<CommentResponse> comments(@PathVariable Long id,@AuthenticationPrincipal AuthenticatedUser user){return tickets.getComments(id,user);}
 @PatchMapping("/{id}/status") @PreAuthorize("hasAnyRole('AGENT','ADMIN')") @Operation(summary="Update ticket status")
 public TicketResponse updateStatus(@PathVariable Long id,@Valid @RequestBody UpdateStatusRequest request,@AuthenticationPrincipal AuthenticatedUser user){return tickets.updateStatus(id,request.status(),user);}
 @PostMapping("/{id}/verify-reply") @PreAuthorize("hasAnyRole('AGENT','ADMIN')") @Operation(summary="Verify reply and resolve ticket")
 public TicketResponse verifyReply(@PathVariable Long id,@Valid @RequestBody VerifyReplyRequest request,@AuthenticationPrincipal AuthenticatedUser user){return tickets.verifyReply(id,request,user);}
}
