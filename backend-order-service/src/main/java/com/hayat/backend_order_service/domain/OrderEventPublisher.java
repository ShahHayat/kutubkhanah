package com.hayat.backend_order_service.domain;

import com.hayat.backend_order_service.ApplicationProperties;
import com.hayat.backend_order_service.domain.models.OrderCancelledEvent;
import com.hayat.backend_order_service.domain.models.OrderCreatedEvent;
import com.hayat.backend_order_service.domain.models.OrderDeliveredEvent;
import com.hayat.backend_order_service.domain.models.OrderErrorEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
class OrderEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    private final ApplicationProperties applicationProperties;

    OrderEventPublisher(RabbitTemplate rabbitTemplate, ApplicationProperties applicationProperties) {
        this.rabbitTemplate = rabbitTemplate;
        this.applicationProperties = applicationProperties;
    }

    public void publish(OrderCreatedEvent event) {
        this.send(applicationProperties.newOrdersQueue(), event);
    }

    public void publish(OrderDeliveredEvent event) {
        this.send(applicationProperties.deliveredOrdersQueue(), event);
    }

    public void publish(OrderCancelledEvent event) {
        this.send(applicationProperties.cancelledOrdersQueue(), event);
    }

    public void publish(OrderErrorEvent event) {
        this.send(applicationProperties.errorOrdersQueue(), event);
    }

    private void send(String routingKey, Object payload) {
        rabbitTemplate.convertAndSend(applicationProperties.orderEventsExchange(), routingKey, payload);
    }
}
