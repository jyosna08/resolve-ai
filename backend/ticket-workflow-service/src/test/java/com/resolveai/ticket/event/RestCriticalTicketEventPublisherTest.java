package com.resolveai.ticket.event;
import com.resolveai.ticket.client.*;
import com.resolveai.ticket.enums.Priority;
import feign.FeignException;
import feign.Request;
import feign.Response;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.*;
class RestCriticalTicketEventPublisherTest {
 @Test void mapsEventAndCallsNotificationClient(){NotificationClient client=mock(NotificationClient.class);CriticalEventDelivery delivery=new DefaultCriticalEventDelivery(client);var publisher=new RestCriticalTicketEventPublisher(delivery);var deadline=LocalDateTime.of(2026,11,17,9,30);var event=new CriticalTicketEvent(51L,"Payment down",Priority.CRITICAL,"Priya",deadline);publisher.publish(event);verify(client).publishCriticalEvent(new CriticalEventPayload(51L,"Payment down",Priority.CRITICAL,"Priya",deadline));}
 @Test void swallowsFeignFailure(){NotificationClient client=mock(NotificationClient.class);doThrow(feignFailure()).when(client).publishCriticalEvent(any());var publisher=new RestCriticalTicketEventPublisher(new DefaultCriticalEventDelivery(client));assertThatCode(()->publisher.publish(new CriticalTicketEvent(52L,"Payment down",Priority.CRITICAL,null,LocalDateTime.now()))).doesNotThrowAnyException();}
 private FeignException feignFailure(){Request request=Request.create(Request.HttpMethod.POST,"/api/notifications/events/critical",Map.of(),null,StandardCharsets.UTF_8,null);return FeignException.errorStatus("NotificationClient#publishCriticalEvent",Response.builder().status(503).reason("Unavailable").request(request).build());}
}
