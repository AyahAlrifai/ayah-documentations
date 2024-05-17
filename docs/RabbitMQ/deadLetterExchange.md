---
sidebar_position: 6
---

# Dead Letter Exchange

## Example 1
```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=deadLetterMessage&routingKey=log5'
```

```text
Message: deadLetterMessage RoutingKey: log5
q5 ------------> Received Message: deadLetterMessage
q5 ------------> Reject Message
2023-12-29T21:15:40.839+03:00  WARN 15876 --- [ntContainer#5-1] s.a.r.l.ConditionalRejectingErrorHandler : Execution of Rabbit message listener failed.

org.springframework.amqp.rabbit.support.ListenerExecutionFailedException: Listener method 'public void com.rabbitmq.example.consumer.Consumer.receiveMessage5(java.lang.String)' threw exception
	at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.invokeHandler(MessagingMessageListenerAdapter.java:286) ~[spring-rabbit-3.1.1.jar:3.1.1]
	at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.invokeHandlerAndProcessResult(MessagingMessageListenerAdapter.java:224) ~[spring-rabbit-3.1.1.jar:3.1.1]
	at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.onMessage(MessagingMessageListenerAdapter.java:149) ~[spring-rabbit-3.1.1.jar:3.1.1]
	.
	.
	.
	at org.springframework.messaging.handler.invocation.InvocableHandlerMethod.invoke(InvocableHandlerMethod.java:119) ~[spring-messaging-6.1.2.jar:6.1.2]
	at org.springframework.amqp.rabbit.listener.adapter.HandlerAdapter.invoke(HandlerAdapter.java:75) ~[spring-rabbit-3.1.1.jar:3.1.1]
	at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.invokeHandler(MessagingMessageListenerAdapter.java:277) ~[spring-rabbit-3.1.1.jar:3.1.1]
	... 15 common frames omitted

deadLetter ------------> Received Message: deadLetterMessage
```
