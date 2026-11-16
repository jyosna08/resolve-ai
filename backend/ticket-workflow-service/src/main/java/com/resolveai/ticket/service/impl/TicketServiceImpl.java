package com.resolveai.ticket.service.impl;
import com.resolveai.ticket.client.*;
import com.resolveai.ticket.config.SlaProperties;
import com.resolveai.ticket.dto.*;
import com.resolveai.ticket.entity.Ticket;
import com.resolveai.ticket.enums.*;
import com.resolveai.ticket.event.*;
import com.resolveai.ticket.security.AuthenticatedUser;
import com.resolveai.ticket.service.*;
import feign.FeignException;
import java.time.LocalDateTime;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
@Service
public class TicketServiceImpl implements TicketService {
 private static final Logger log=LoggerFactory.getLogger(TicketServiceImpl.class);
 private static final String FALLBACK_REPLY="Thank you for contacting us. We have received your request and our team is reviewing it. We will get back to you shortly.";
 private final AiTriageClient ai;private final AuthClient auth;private final TicketPersistencePort persistence;private final CriticalTicketEventPublisher publisher;private final SlaProperties sla;
 public TicketServiceImpl(AiTriageClient ai,AuthClient auth,TicketPersistencePort persistence,CriticalTicketEventPublisher publisher,SlaProperties sla){this.ai=ai;this.auth=auth;this.persistence=persistence;this.publisher=publisher;this.sla=sla;}
 @Override public TicketResponse createTicket(CreateTicketRequest request,AuthenticatedUser user){
  TriageResult triage=triage(request);Category category=parse(triage==null?null:triage.category(),Category.class,Category.GENERAL);
  Ticket ticket=newTicket(request,user,triage,category);AgentWorkload agent=findAgent(category);if(agent!=null){ticket.setAssignedAgentId(agent.id());ticket.setAssignedAgentName(agent.fullName());}
  TicketResponse saved=persistence.create(ticket);incrementIfAssigned(saved.assignedAgentId());publishIfCritical(saved);return saved;
 }
 @Override public List<TicketResponse> listTickets(TicketStatus status,Priority priority,String search,AuthenticatedUser user){return persistence.list(status,priority,search,user);}
 @Override public TicketResponse getTicket(Long id,AuthenticatedUser user){return persistence.get(id,user);}
 @Override public List<CommentResponse> getComments(Long id,AuthenticatedUser user){return persistence.getComments(id,user);}
 @Override public TicketResponse updateStatus(Long id,TicketStatus status){TicketPersistenceService.Mutation result=persistence.updateStatus(id,status);decrementIfAssigned(result.decrementAgentId());return result.ticket();}
 @Override public TicketResponse verifyReply(Long id,VerifyReplyRequest request,AuthenticatedUser user){TicketPersistenceService.Mutation result=persistence.verifyReply(id,request,user);decrementIfAssigned(result.decrementAgentId());return result.ticket();}
 @Override public DashboardStatsResponse dashboardStats(AuthenticatedUser user){return persistence.stats(user,Math.toIntExact(sla.warningMinutes()));}
 private TriageResult triage(CreateTicketRequest request){try{return ai.analyze(new AnalyzeRequest(request.title(),request.description()));}catch(Exception ex){log.warn("AI triage unavailable; using defaults");return null;}}
 private Ticket newTicket(CreateTicketRequest request,AuthenticatedUser user,TriageResult result,Category category){
  Ticket t=new Ticket();t.setTitle(request.title());t.setDescription(request.description());t.setReporterId(user.userId());t.setStatus(TicketStatus.TO_DO);t.setCategory(category);
  t.setPriority(parse(result==null?null:result.priority(),Priority.class,Priority.MEDIUM));t.setSentiment(parse(result==null?null:result.sentiment(),Sentiment.class,Sentiment.NEUTRAL));
  t.setAiSummary(textOr(result==null?null:result.summary(),truncate(request.title(),160)));t.setAiDraftReply(textOr(result==null?null:result.draftReply(),FALLBACK_REPLY));t.setSlaDeadline(LocalDateTime.now().plusHours(sla.hours()));return t;
 }
 private AgentWorkload findAgent(Category category){try{AgentWorkload a=auth.leastLoaded(category.name());return a==null||a.id()==null?null:a;}catch(FeignException ex){log.warn("No agent available for category={} status={}",category,ex.status());return null;}catch(Exception ex){log.warn("Agent lookup failed for category={}",category);return null;}}
 private void incrementIfAssigned(Long id){if(id==null)return;try{auth.increment(id);}catch(Exception ex){log.warn("Could not increment assigned agent workload id={}",id);}}
 private void decrementIfAssigned(Long id){if(id==null)return;try{auth.decrement(id);}catch(Exception ex){log.warn("Could not decrement assigned agent workload id={}",id);}}
 private void publishIfCritical(TicketResponse ticket){if(ticket.priority()!=Priority.CRITICAL)return;try{publisher.publish(new CriticalTicketEvent(ticket.id(),ticket.title(),ticket.priority(),ticket.assignedAgentName(),ticket.slaDeadline()));}catch(Exception ex){log.warn("Could not publish critical ticket event id={}",ticket.id());}}
 private String textOr(String value,String fallback){return value==null||value.isBlank()?fallback:value;}
 private String truncate(String text,int size){return text.length()>size?text.substring(0,size):text;}
 private <E extends Enum<E>> E parse(String value,Class<E> type,E fallback){try{return Enum.valueOf(type,value.trim().toUpperCase(Locale.ROOT));}catch(Exception ex){return fallback;}}
}
