package com.resolveai.ticket.event;
import com.resolveai.ticket.client.CriticalEventPayload;
public interface CriticalEventDelivery { CriticalEventPayload payload(CriticalTicketEvent event); void sendRest(CriticalTicketEvent event); }
