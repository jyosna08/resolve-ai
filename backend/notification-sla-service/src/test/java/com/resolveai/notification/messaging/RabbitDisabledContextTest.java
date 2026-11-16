package com.resolveai.notification.messaging;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest @ActiveProfiles("test") class RabbitDisabledContextTest {
 @Autowired ApplicationContext context;
 @Test void hasNoRabbitConsumerOrConfigurationWhenDisabled(){assertThat(context.getBeansOfType(CriticalTicketEventListener.class)).isEmpty();assertThat(context.getBeansOfType(RabbitMqConfig.class)).isEmpty();}
}
