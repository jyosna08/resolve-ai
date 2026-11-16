package com.resolveai.notification.messaging;
import com.resolveai.notification.dto.CriticalTicketEventRequest;
import com.resolveai.notification.service.AlertService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
class CriticalTicketEventListenerTest {
 @Test void handlesEventOnce(){AlertService service=mock(AlertService.class);CriticalTicketEventListener listener=new CriticalTicketEventListener(service);var event=new CriticalTicketEventRequest(9L,"Title","CRITICAL","Agent",LocalDateTime.now());listener.handle(event);verify(service).recordCriticalEvent(event);}
 @Test void wrapsFailuresAsNonRequeueable(){AlertService service=mock(AlertService.class);CriticalTicketEventListener listener=new CriticalTicketEventListener(service);var event=new CriticalTicketEventRequest(9L,"Title","CRITICAL","Agent",LocalDateTime.now());when(service.recordCriticalEvent(event)).thenThrow(new IllegalStateException("failed"));assertThatThrownBy(()->listener.handle(event)).isInstanceOf(AmqpRejectAndDontRequeueException.class);}
}
