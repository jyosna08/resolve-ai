package com.resolveai.ticket.event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name="app.rabbitmq.enabled",havingValue="true")
public class RabbitCriticalTicketEventPublisher implements CriticalTicketEventPublisher {
 private static final Logger log=LoggerFactory.getLogger(RabbitCriticalTicketEventPublisher.class);
 private final AmqpTemplate rabbitTemplate;private final CriticalEventDelivery fallback;
 public RabbitCriticalTicketEventPublisher(AmqpTemplate rabbitTemplate,CriticalEventDelivery fallback){this.rabbitTemplate=rabbitTemplate;this.fallback=fallback;}
 @Override public void publish(CriticalTicketEvent event){try{rabbitTemplate.convertAndSend(CriticalEventRabbitConfiguration.EXCHANGE,CriticalEventRabbitConfiguration.ROUTING_KEY,fallback.payload(event));}catch(Exception rabbitFailure){log.warn("RabbitMQ publish failed for ticketId={}; attempting REST fallback",event.ticketId());try{fallback.sendRest(event);}catch(Exception restFailure){log.error("Critical event delivery failed through RabbitMQ and REST for ticketId={}",event.ticketId(),restFailure);}}}
}
