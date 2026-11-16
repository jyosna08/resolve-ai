package com.resolveai.notification.service.impl;
import com.resolveai.notification.dto.CriticalTicketEventRequest;
import com.resolveai.notification.entity.SlaAlert;
import com.resolveai.notification.enums.AlertType;
import com.resolveai.notification.exception.AlertNotFoundException;
import com.resolveai.notification.repository.SlaAlertRepository;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class) class AlertServiceImplTest {
 @Mock SlaAlertRepository repo;AlertServiceImpl service;final LocalDateTime now=LocalDateTime.of(2026,11,16,12,0);
 @BeforeEach void setup(){service=new AlertServiceImpl(repo,Clock.fixed(now.toInstant(ZoneOffset.UTC),ZoneOffset.UTC));}
 @Test void recordCriticalCreatesExpectedAlert(){var event=event(14,"Checkout down","Priya",now.plusHours(24));when(repo.findByTicketIdAndAlertType(14L,AlertType.CRITICAL_ESCALATION)).thenReturn(Optional.empty());when(repo.saveAndFlush(any())).thenAnswer(i->{SlaAlert a=i.getArgument(0);a.setId(1L);return a;});var r=service.recordCriticalEvent(event);assertThat(r.created()).isTrue();assertThat(r.alert().alertType()).isEqualTo(AlertType.CRITICAL_ESCALATION);assertThat(r.alert().message()).isEqualTo("CRITICAL ticket #14 'Checkout down' assigned to Priya. SLA deadline: 2026-11-17T12:00.");}
 @Test void duplicateReturnsExistingWithoutSaving(){SlaAlert existing=alert(4,14,AlertType.CRITICAL_ESCALATION,"Title",now.plusHours(1));when(repo.findByTicketIdAndAlertType(14L,AlertType.CRITICAL_ESCALATION)).thenReturn(Optional.of(existing));var result=service.recordCriticalEvent(event(14,"Title",null,now.plusHours(1)));assertThat(result.created()).isFalse();assertThat(result.alert().id()).isEqualTo(4L);verify(repo,never()).saveAndFlush(any());}
 @Test void insertRaceReturnsExistingRow(){SlaAlert existing=alert(5,14,AlertType.CRITICAL_ESCALATION,"Title",now.plusHours(1));when(repo.findByTicketIdAndAlertType(14L,AlertType.CRITICAL_ESCALATION)).thenReturn(Optional.empty(),Optional.of(existing));when(repo.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("unique"));var result=service.recordCriticalEvent(event(14,"Title",null,now.plusHours(1)));assertThat(result.created()).isFalse();assertThat(result.alert().id()).isEqualTo(5L);}
 @Test void listActiveAlertsMapsRepositoryResults(){when(repo.findByAcknowledgedFalseOrderByCreatedAtDesc()).thenReturn(List.of(alert(3,8,AlertType.SLA_BREACH,"T",now)));assertThat(service.listActiveAlerts()).hasSize(1);}
 @Test void acknowledgeSuccessAndMissing(){SlaAlert a=alert(2,8,AlertType.CRITICAL_ESCALATION,"T",now);when(repo.findById(2L)).thenReturn(Optional.of(a));when(repo.save(a)).thenReturn(a);assertThat(service.acknowledge(2L).acknowledged()).isTrue();when(repo.findById(3L)).thenReturn(Optional.empty());assertThatThrownBy(()->service.acknowledge(3L)).isInstanceOf(AlertNotFoundException.class);}
 @Test void flaggingCreatesOnlyOverdueUnacknowledgedBreachesAndIsIdempotent(){SlaAlert overdue=alert(1,11,AlertType.CRITICAL_ESCALATION,"Late",now.minusMinutes(1));SlaAlert due=alert(2,12,AlertType.CRITICAL_ESCALATION,"Soon",now.plusMinutes(1));when(repo.findByAlertTypeAndAcknowledgedFalseAndSlaDeadlineBefore(AlertType.CRITICAL_ESCALATION,now)).thenReturn(List.of(overdue));when(repo.existsByTicketIdAndAlertType(11L,AlertType.SLA_BREACH)).thenReturn(false,true);when(repo.saveAndFlush(any())).thenAnswer(i->i.getArgument(0));assertThat(service.flagSlaBreaches()).isEqualTo(1);assertThat(service.flagSlaBreaches()).isZero();verify(repo,times(1)).saveAndFlush(argThat(a->a.getAlertType()==AlertType.SLA_BREACH));}
 private CriticalTicketEventRequest event(long id,String title,String agent,LocalDateTime deadline){return new CriticalTicketEventRequest(id,title,"CRITICAL",agent,deadline);}
 private SlaAlert alert(long id,long ticketId,AlertType type,String title,LocalDateTime deadline){SlaAlert a=new SlaAlert();a.setId(id);a.setTicketId(ticketId);a.setTicketTitle(title);a.setAlertType(type);a.setSlaDeadline(deadline);a.setMessage("message");return a;}
}
