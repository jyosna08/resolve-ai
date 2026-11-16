package com.resolveai.notification.messaging;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
@ConditionalOnProperty(name="app.rabbitmq.enabled",havingValue="true")
public class RabbitMqConfig {
 public static final String EXCHANGE="resolveai.exchange";public static final String ROUTING_KEY="ticket.critical";public static final String QUEUE="ticket.critical.queue";
 @Bean DirectExchange criticalExchange(){return new DirectExchange(EXCHANGE,true,false);}
 @Bean Queue criticalQueue(){return QueueBuilder.durable(QUEUE).build();}
 @Bean Binding criticalBinding(Queue criticalQueue,DirectExchange criticalExchange){return BindingBuilder.bind(criticalQueue).to(criticalExchange).with(ROUTING_KEY);}
 @Bean Jackson2JsonMessageConverter rabbitMessageConverter(ObjectMapper mapper){
  Jackson2JsonMessageConverter converter=new Jackson2JsonMessageConverter(mapper.copy().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES));DefaultJackson2JavaTypeMapper typeMapper=new DefaultJackson2JavaTypeMapper();
  typeMapper.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.INFERRED);typeMapper.setTrustedPackages();converter.setJavaTypeMapper(typeMapper);return converter;
 }
 @Bean SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory,Jackson2JsonMessageConverter converter){
  SimpleRabbitListenerContainerFactory factory=new SimpleRabbitListenerContainerFactory();factory.setConnectionFactory(connectionFactory);factory.setMessageConverter(converter);factory.setDefaultRequeueRejected(false);return factory;
 }
 @Bean RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,Jackson2JsonMessageConverter converter){RabbitTemplate template=new RabbitTemplate(connectionFactory);template.setMessageConverter(converter);return template;}
}
