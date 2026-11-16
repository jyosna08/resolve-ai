package com.resolveai.ticket.event;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest @ActiveProfiles("test") class PublisherModeContextTest {
 @Autowired ApplicationContext context;
 @Test void disabledModeUsesOnlyRestPublisher(){assertThat(context.getBeansOfType(CriticalTicketEventPublisher.class)).hasSize(1);assertThat(context.getBeansOfType(RestCriticalTicketEventPublisher.class)).hasSize(1);assertThat(context.getBeansOfType(RabbitCriticalTicketEventPublisher.class)).isEmpty();assertThat(context.getBeansOfType(CriticalEventRabbitConfiguration.class)).isEmpty();}
}
