package com.resolveai.ticket.service;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.entity.*;
import com.resolveai.ticket.enums.*;
import com.resolveai.ticket.exception.*;
import com.resolveai.ticket.mapper.TicketMapper;
import com.resolveai.ticket.repository.*;
import com.resolveai.ticket.security.AuthenticatedUser;
import java.time.*;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class TicketPersistenceService implements TicketPersistencePort {
 private final TicketRepository tickets;private final TicketCommentRepository comments;
 public TicketPersistenceService(TicketRepository tickets,TicketCommentRepository comments){this.tickets=tickets;this.comments=comments;}
 @Override @Transactional public Ticket create(Ticket ticket){return tickets.save(ticket);}
 @Override @Transactional(readOnly=true) public List<Ticket> list(TicketStatus status,Priority priority,String search,AuthenticatedUser user){
  Specification<Ticket> spec=scope(user).and(status(status)).and(priority(priority)).and(search(search));
  return tickets.findAll(spec,Sort.by(Sort.Direction.DESC,"createdAt"));
 }
 @Override @Transactional(readOnly=true) public Ticket get(Long id,AuthenticatedUser user){return visible(id,user);}
 @Override @Transactional(readOnly=true) public List<CommentResponse> getComments(Long id,AuthenticatedUser user){visible(id,user);return comments.findAllByTicketIdOrderByCreatedAtAscIdAsc(id).stream().map(TicketMapper::toResponse).toList();}
 @Override @Transactional public Mutation updateStatus(Long id,TicketStatus status){
  Ticket ticket=required(id);TicketStatus old=ticket.getStatus();if(!allowed(old,status))throw new InvalidStatusTransitionException();ticket.setStatus(status);
  Ticket saved=tickets.save(ticket);return new Mutation(saved,status==TicketStatus.RESOLVED?saved.getAssignedAgentId():null);
 }
 @Override @Transactional public Mutation verifyReply(Long id,VerifyReplyRequest request,AuthenticatedUser user){
  Ticket ticket=required(id);if(ticket.getStatus()==TicketStatus.RESOLVED)throw new InvalidStatusTransitionException();
  TicketComment comment=new TicketComment();comment.setTicket(ticket);comment.setAuthorId(user.userId());comment.setAuthorName(user.fullName());comment.setMessage(request.replyMessage());comment.setAiVerified(true);comments.save(comment);
  ticket.setStatus(TicketStatus.RESOLVED);Ticket saved=tickets.save(ticket);return new Mutation(saved,saved.getAssignedAgentId());
 }
 @Override @Transactional(readOnly=true) public DashboardStatsResponse stats(AuthenticatedUser user,int warningMinutes){
  LocalDateTime now=LocalDateTime.now();Specification<Ticket> scoped=scope(user);Specification<Ticket> open=scoped.and((r,q,b)->b.notEqual(r.get("status"),TicketStatus.RESOLVED));
  long total=tickets.count(open);long critical=tickets.count(open.and((r,q,b)->b.equal(r.get("priority"),Priority.CRITICAL)));
  LocalDateTime dayStart=LocalDate.now().atStartOfDay();long resolved=tickets.count(scoped.and((r,q,b)->b.and(b.equal(r.get("status"),TicketStatus.RESOLVED),b.greaterThanOrEqualTo(r.get("updatedAt"),dayStart))));
  long warning=tickets.count(open.and((r,q,b)->b.lessThanOrEqualTo(r.get("slaDeadline"),now.plusMinutes(warningMinutes))));return new DashboardStatsResponse(total,critical,resolved,warning);
 }
 private Ticket required(Long id){return tickets.findById(id).orElseThrow(()->new TicketNotFoundException(id));}
 private Ticket visible(Long id,AuthenticatedUser user){Ticket ticket=required(id);if(isCustomer(user)&&!ticket.getReporterId().equals(user.userId()))throw new TicketNotFoundException(id);return ticket;}
 private Specification<Ticket> scope(AuthenticatedUser user){return isCustomer(user)?(r,q,b)->b.equal(r.get("reporterId"),user.userId()):(r,q,b)->b.conjunction();}
 private Specification<Ticket> status(TicketStatus value){return value==null?null:(r,q,b)->b.equal(r.get("status"),value);}
 private Specification<Ticket> priority(Priority value){return value==null?null:(r,q,b)->b.equal(r.get("priority"),value);}
 private Specification<Ticket> search(String value){if(value==null||value.isBlank())return null;String pattern="%"+value.trim().toLowerCase(Locale.ROOT)+"%";return(r,q,b)->b.or(b.like(b.lower(r.get("title")),pattern),b.like(b.lower(r.get("description")),pattern));}
 private boolean isCustomer(AuthenticatedUser user){return "CUSTOMER".equalsIgnoreCase(user.role());}
 private boolean allowed(TicketStatus from,TicketStatus to){return from==TicketStatus.TO_DO&&(to==TicketStatus.IN_PROGRESS||to==TicketStatus.RESOLVED)||from==TicketStatus.IN_PROGRESS&&(to==TicketStatus.TO_DO||to==TicketStatus.RESOLVED);}
 public record Mutation(Ticket ticket,Long decrementAgentId) { }
}
