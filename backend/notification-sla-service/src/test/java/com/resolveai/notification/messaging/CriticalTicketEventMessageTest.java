package com.resolveai.notification.messaging;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.resolveai.notification.dto.CriticalTicketEventRequest;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import static org.assertj.core.api.Assertions.assertThat;
class CriticalTicketEventMessageTest {
 @Test void deserializesContractBodyAndIgnoresUntrustedTypeHeaderAndExtraFields()throws Exception{
  ObjectMapper mapper=new ObjectMapper().registerModule(new JavaTimeModule());Jackson2JsonMessageConverter converter=new RabbitMqConfig().rabbitMessageConverter(mapper);
  String body="{\"ticketId\":101,\"title\":\"Payment Gateway Failure\",\"priority\":\"CRITICAL\",\"assignedAgentName\":\"Priya Sharma\",\"slaDeadline\":\"2026-11-17T09:30:00\",\"futureField\":\"ignored\"}";
  MessageProperties props=new MessageProperties();props.setContentType(MessageProperties.CONTENT_TYPE_JSON);props.setHeader("__TypeId__","some.other.module.CriticalTicketEvent");
  props.setInferredArgumentType(CriticalTicketEventRequest.class);
  Message message=new Message(body.getBytes(java.nio.charset.StandardCharsets.UTF_8),props);
  CriticalTicketEventRequest event=(CriticalTicketEventRequest)converter.fromMessage(message,CriticalTicketEventRequest.class);
  assertThat(event.ticketId()).isEqualTo(101L);assertThat(event.slaDeadline()).isEqualTo(LocalDateTime.of(2026,11,17,9,30));assertThat(event.assignedAgentName()).isEqualTo("Priya Sharma");
 }
}
