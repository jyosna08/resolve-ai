package com.resolveai.ticket.event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
@Component
public class LoggingCriticalTicketEventPublisher implements CriticalTicketEventPublisher {
 private static final Logger log=LoggerFactory.getLogger(LoggingCriticalTicketEventPublisher.class);
 @Override public void publish(CriticalTicketEvent event) { log.info("Critical ticket event ticketId={} priority={} assignedAgent={}",event.ticketId(),event.priority(),event.assignedAgentName()); }
}
