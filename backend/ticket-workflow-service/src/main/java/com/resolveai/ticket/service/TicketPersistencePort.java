package com.resolveai.ticket.service;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.entity.Ticket;
import com.resolveai.ticket.enums.*;
import com.resolveai.ticket.security.AuthenticatedUser;
import java.util.List;
public interface TicketPersistencePort {
 Ticket create(Ticket ticket);
 List<Ticket> list(TicketStatus status,Priority priority,String search,AuthenticatedUser user);
 Ticket get(Long id,AuthenticatedUser user);
 List<CommentResponse> getComments(Long id,AuthenticatedUser user);
 TicketPersistenceService.Mutation updateStatus(Long id,TicketStatus status);
 TicketPersistenceService.Mutation verifyReply(Long id,VerifyReplyRequest request,AuthenticatedUser user);
 DashboardStatsResponse stats(AuthenticatedUser user,int warningMinutes);
}
