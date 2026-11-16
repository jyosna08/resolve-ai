package com.resolveai.ticket.service;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.enums.*;
import com.resolveai.ticket.security.AuthenticatedUser;
import java.util.List;
public interface TicketService {
 TicketResponse createTicket(CreateTicketRequest request,AuthenticatedUser user);
 List<TicketResponse> listTickets(TicketStatus status,Priority priority,String search,AuthenticatedUser user);
 TicketResponse getTicket(Long id,AuthenticatedUser user);
 List<CommentResponse> getComments(Long id,AuthenticatedUser user);
 TicketResponse updateStatus(Long id,TicketStatus status);
 TicketResponse verifyReply(Long id,VerifyReplyRequest request,AuthenticatedUser user);
 DashboardStatsResponse dashboardStats(AuthenticatedUser user);
}
