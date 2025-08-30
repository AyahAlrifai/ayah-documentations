---
sidebar_position: 3
---

# Acknowledgment Example

## Example 1

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=HelloWorld&routingKey=log3&expiration=0' \
  -H 'accept: */*'
```
Message Automatically deleted from queue when the consumer get the message.

```text
Message: HelloWorld RoutingKey: log3
q3 ------------> Received Message: HelloWorld
q3 ------------> Positive ACK 
```

## Example 2

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=don%27t%20requeue&routingKey=log4&expiration=0' \
  -H 'accept: */*'
```
Message deleted from queue after consumer reject message without requeue it.

```text
Message: don't requeue RoutingKey: log4
q4 ------------> Received Message: don't requeue
q4 ------------> Negative ACK, don't requeue message
```

## Example 3

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=don%27t%20requeue&routingKey=log4&expiration=0' \
  -H 'accept: */*'
```
Message requeue to dead letter exchange when consumer reject message with requeue it.

Note: when requeue message, the queue should link with dead letter exchange.

```text
Message: requeue RoutingKey: log4
q4 ------------> Received Message: requeue
q4 ------------> Negative ACK, requeue message
deadLetter ------------> Received Message: requeue
```

## Example 4

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=requeuedd&routingKey=log4&expiration=0' \
  -H 'accept: */*'
```

In this case the message is in `unacked` list and will move to `ready` list after application stop.

```text
Message: requeuedd RoutingKey: log4
q4 ------------> Received Message: requeuedd
```
