package com.resolveai.notification.messaging;
import com.resolveai.notification.dto.CriticalTicketEventRequest;
import com.resolveai.notification.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name="app.rabbitmq.enabled",havingValue="true")
public class CriticalTicketEventListener {
 private static final Logger log=LoggerFactory.getLogger(CriticalTicketEventListener.class);
 private final AlertService alerts;
 public CriticalTicketEventListener(AlertService alerts){this.alerts=alerts;}
 @RabbitListener(queues=RabbitMqConfig.QUEUE) public void handle(CriticalTicketEventRequest event){
  try{alerts.recordCriticalEvent(event);}catch(Exception ex){log.error("Unable to process critical ticket event",ex);throw new AmqpRejectAndDontRequeueException("Critical ticket event cannot be processed",ex);}
 }
}
