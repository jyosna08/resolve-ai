package com.resolveai.ticket.event;
import com.resolveai.ticket.client.CriticalEventPayload;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.AmqpTemplate;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class) class RabbitCriticalTicketEventPublisherTest {
 @Mock AmqpTemplate rabbit;@Mock CriticalEventDelivery fallback;RabbitCriticalTicketEventPublisher publisher;CriticalTicketEvent event;
 @BeforeEach void setup(){publisher=new RabbitCriticalTicketEventPublisher(rabbit,fallback);event=new CriticalTicketEvent(31L,"Payment outage",com.resolveai.ticket.enums.Priority.CRITICAL,"Agent Name",LocalDateTime.of(2026,11,17,9,30));when(fallback.payload(event)).thenReturn(new CriticalEventPayload(31L,"Payment outage",com.resolveai.ticket.enums.Priority.CRITICAL,"Agent Name",event.slaDeadline()));}
 @Test void successPublishesContractPayloadWithoutRestFallback(){publisher.publish(event);ArgumentCaptor<Object> payload=ArgumentCaptor.forClass(Object.class);verify(rabbit).convertAndSend(eq("resolveai.exchange"),eq("ticket.critical"),payload.capture());assertThat(payload.getValue()).isEqualTo(new CriticalEventPayload(31L,"Payment outage",com.resolveai.ticket.enums.Priority.CRITICAL,"Agent Name",event.slaDeadline()));verify(fallback,never()).sendRest(any());}
 @Test void rabbitFailureFallsBackToRestWithoutEscaping(){doThrow(new AmqpException("broker unavailable"){}).when(rabbit).convertAndSend(anyString(),anyString(),any(CriticalEventPayload.class));publisher.publish(event);verify(fallback).sendRest(event);}
 @Test void rabbitAndRestFailuresAreSwallowed(){doThrow(new AmqpException("broker unavailable"){}).when(rabbit).convertAndSend(anyString(),anyString(),any(CriticalEventPayload.class));doThrow(new IllegalStateException("rest unavailable")).when(fallback).sendRest(event);org.assertj.core.api.Assertions.assertThatCode(()->publisher.publish(event)).doesNotThrowAnyException();}
}
