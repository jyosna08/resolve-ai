package com.resolveai.notification.service.impl;
import com.resolveai.notification.dto.*;
import com.resolveai.notification.entity.SlaAlert;
import com.resolveai.notification.enums.AlertType;
import com.resolveai.notification.exception.AlertNotFoundException;
import com.resolveai.notification.mapper.AlertMapper;
import com.resolveai.notification.repository.SlaAlertRepository;
import com.resolveai.notification.service.AlertService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AlertServiceImpl implements AlertService {
 private static final Logger log=LoggerFactory.getLogger(AlertServiceImpl.class);
 private final SlaAlertRepository alerts;private final Clock clock;
 public AlertServiceImpl(SlaAlertRepository alerts,Clock clock){this.alerts=alerts;this.clock=clock;}
 @Override public RecordResult recordCriticalEvent(CriticalTicketEventRequest event){
  var existing=alerts.findByTicketIdAndAlertType(event.ticketId(),AlertType.CRITICAL_ESCALATION);if(existing.isPresent())return new RecordResult(AlertMapper.toResponse(existing.get()),false);
  SlaAlert alert=new SlaAlert();alert.setTicketId(event.ticketId());alert.setTicketTitle(event.title());alert.setAlertType(AlertType.CRITICAL_ESCALATION);alert.setSlaDeadline(event.slaDeadline());alert.setMessage(criticalMessage(event));
  try{return new RecordResult(AlertMapper.toResponse(alerts.saveAndFlush(alert)),true);}catch(DataIntegrityViolationException race){return existingAfterRace(event.ticketId());}
 }
 @Override @Transactional(readOnly=true) public List<AlertResponse> listActiveAlerts(){return alerts.findByAcknowledgedFalseOrderByCreatedAtDesc().stream().map(AlertMapper::toResponse).toList();}
 @Override @Transactional public AlertResponse acknowledge(Long id){SlaAlert alert=alerts.findById(id).orElseThrow(()->new AlertNotFoundException(id));alert.setAcknowledged(true);return AlertMapper.toResponse(alerts.save(alert));}
 @Override public int flagSlaBreaches(){int created=0;LocalDateTime now=LocalDateTime.now(clock);for(SlaAlert critical:alerts.findByAlertTypeAndAcknowledgedFalseAndSlaDeadlineBefore(AlertType.CRITICAL_ESCALATION,now))created+=createBreachIfMissing(critical);return created;}
 private String criticalMessage(CriticalTicketEventRequest e){String agent=e.assignedAgentName()==null||e.assignedAgentName().isBlank()?"nobody yet":e.assignedAgentName();return "CRITICAL ticket #"+e.ticketId()+" '"+e.title()+"' assigned to "+agent+". SLA deadline: "+e.slaDeadline()+".";}
 private RecordResult existingAfterRace(Long ticketId){return alerts.findByTicketIdAndAlertType(ticketId,AlertType.CRITICAL_ESCALATION).map(a->new RecordResult(AlertMapper.toResponse(a),false)).orElseThrow(()->new IllegalStateException("Duplicate alert row was not available after insert conflict"));}
 private int createBreachIfMissing(SlaAlert critical){if(alerts.existsByTicketIdAndAlertType(critical.getTicketId(),AlertType.SLA_BREACH))return 0;SlaAlert breach=new SlaAlert();breach.setTicketId(critical.getTicketId());breach.setTicketTitle(critical.getTicketTitle());breach.setAlertType(AlertType.SLA_BREACH);breach.setSlaDeadline(critical.getSlaDeadline());breach.setMessage("SLA breached for ticket #"+critical.getTicketId()+" '"+critical.getTicketTitle()+"' (deadline "+critical.getSlaDeadline()+").");try{alerts.saveAndFlush(breach);log.info("Created SLA breach alert ticketId={}",critical.getTicketId());return 1;}catch(DataIntegrityViolationException duplicate){return 0;}}
}
