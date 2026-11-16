package com.resolveai.ticket.event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name="app.rabbitmq.enabled",havingValue="false",matchIfMissing=true)
public class RestCriticalTicketEventPublisher implements CriticalTicketEventPublisher {
 private static final Logger log=LoggerFactory.getLogger(RestCriticalTicketEventPublisher.class);
 private final CriticalEventDelivery delivery;
 public RestCriticalTicketEventPublisher(CriticalEventDelivery delivery){this.delivery=delivery;}
 @Override public void publish(CriticalTicketEvent event){try{delivery.sendRest(event);}catch(Exception ex){log.error("Critical event REST delivery failed for ticketId={}",event.ticketId(),ex);}}
}
