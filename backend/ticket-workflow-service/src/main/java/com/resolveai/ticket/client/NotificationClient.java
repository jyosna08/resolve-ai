package com.resolveai.ticket.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
@FeignClient(name="notification-sla-service")
public interface NotificationClient { @PostMapping("/api/notifications/events/critical") void publishCriticalEvent(@RequestBody CriticalEventPayload payload); }
