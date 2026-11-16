package com.resolveai.ticket.event;
import com.resolveai.ticket.client.CriticalEventPayload;
import com.resolveai.ticket.client.NotificationClient;
import org.springframework.stereotype.Component;
@Component
public class DefaultCriticalEventDelivery implements CriticalEventDelivery {
 private final NotificationClient notificationClient;
 public DefaultCriticalEventDelivery(NotificationClient notificationClient){this.notificationClient=notificationClient;}
 @Override public CriticalEventPayload payload(CriticalTicketEvent event){return new CriticalEventPayload(event.ticketId(),event.title(),event.priority(),event.assignedAgentName(),event.slaDeadline());}
 @Override public void sendRest(CriticalTicketEvent event){notificationClient.publishCriticalEvent(payload(event));}
}
