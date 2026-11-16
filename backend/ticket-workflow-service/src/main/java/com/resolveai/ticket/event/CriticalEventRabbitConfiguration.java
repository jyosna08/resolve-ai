package com.resolveai.ticket.event;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
@ConditionalOnProperty(name="app.rabbitmq.enabled",havingValue="true")
public class CriticalEventRabbitConfiguration {
 public static final String EXCHANGE="resolveai.exchange";
 public static final String ROUTING_KEY="ticket.critical";
 public static final String QUEUE="ticket.critical.queue";
 @Bean DirectExchange criticalTicketExchange(){return new DirectExchange(EXCHANGE,true,false);}
 @Bean Queue criticalTicketQueue(){return QueueBuilder.durable(QUEUE).build();}
 @Bean Binding criticalTicketBinding(Queue criticalTicketQueue,DirectExchange criticalTicketExchange){return BindingBuilder.bind(criticalTicketQueue).to(criticalTicketExchange).with(ROUTING_KEY);}
 @Bean Jackson2JsonMessageConverter criticalEventMessageConverter(ObjectMapper mapper){return new Jackson2JsonMessageConverter(mapper.copy().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS));}
 @Bean RabbitTemplate criticalEventRabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,Jackson2JsonMessageConverter criticalEventMessageConverter){RabbitTemplate template=new RabbitTemplate(connectionFactory);template.setMessageConverter(criticalEventMessageConverter);return template;}
}
