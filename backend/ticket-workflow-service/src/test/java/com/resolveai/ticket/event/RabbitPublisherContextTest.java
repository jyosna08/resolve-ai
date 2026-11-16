package com.resolveai.ticket.event;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest(properties="app.rabbitmq.enabled=true") @ActiveProfiles("test") class RabbitPublisherContextTest {
 @Autowired ApplicationContext context;
 @Test void enabledModeLoadsRabbitPublisherWithoutConnectingToBroker(){assertThat(context.getBeansOfType(CriticalTicketEventPublisher.class)).hasSize(1);assertThat(context.getBeansOfType(RabbitCriticalTicketEventPublisher.class)).hasSize(1);assertThat(context.getBeansOfType(org.springframework.amqp.rabbit.core.RabbitTemplate.class)).hasSize(1);}
}
