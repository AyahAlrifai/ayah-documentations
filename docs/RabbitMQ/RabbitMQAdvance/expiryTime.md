---
sidebar_position: 2
---

# Expiry Time

## Example 1

Send this request 3 times.

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=HelloWorld&routingKey=log1&expiration=0' \
  -H 'accept: */*'
```
- q1 `x-message-ttl` equal 3000ml.
- q1 `prefetch count` equal 2.
- q1 is connect to `dead-letter-exchange`.
- Each message need 4000ms to execute in q1.
- So q1 will get first message and second message, but third message will be routing
to dead letter exchange.

```text
Message: HelloWorld RoutingKey: log1
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
Message: HelloWorld RoutingKey: log1
Message: HelloWorld RoutingKey: log1
deadLetter ------------> Received Message: HelloWorld
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
```

## Example 2

Send this request 3 times.

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=HelloWorld&routingKey=log2&expiration=0' \
  -H 'accept: */*'
```
- q2 `x-message-ttl` equal 3000ml.
- q2 `prefetch count` equal 2.
- Each message need 4000ms to execute in q2.
- so q2 will get first message and second message, but third message will be deleted because q2
  not link with dead letter exchange.

```text
Message: HelloWorld RoutingKey: log2
q2 ------------> Received Message: HelloWorld
q2 ------------> Waiting 4000ms
Message: HelloWorld RoutingKey: log2
Message: HelloWorld RoutingKey: log2
q2 ------------> Received Message: HelloWorld
q2 ------------> Waiting 4000ms
```

## Example 3

Send this request 3 times.

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=HelloWorld&routingKey=log1&expiration=2000' \
  -H 'accept: */*'
```

- q1 `x-message-ttl` equal 3000ml.
- q1 `prefetch count` equal 2.
- q1 is connect to `dead-letter-exchange`.
- Each message need 4000ms to execute in q1.
- The expiration for each message is 2000 and 2000 less than 3000, so the `x-message-ttl` will not override by message expiration time, so it will work same as $$Example 1$$

```text
Message: HelloWorld RoutingKey: log1
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
Message: HelloWorld RoutingKey: log1
Message: HelloWorld RoutingKey: log1
deadLetter ------------> Received Message: HelloWorld
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
```

## Example 4

Send this request 3 times.

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=HelloWorld&routingKey=log1&expiration=5000' \
  -H 'accept: */*'
```

- q1 `x-message-ttl` equal 3000ml.
- q1 `prefetch count` equal 2.
- q1 is connect to `dead-letter-exchange`.
- Each message need 4000ms to execute in q1.
- The expiration for each message is 5000 and 5000 greater than 3000, so the `x-message-ttl` will be override by message expiration time, so q1 will receive all messages.

```text
Message: HelloWorld RoutingKey: log1
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
Message: HelloWorld RoutingKey: log1
Message: HelloWorld RoutingKey: log1
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
q1 ------------> Received Message: HelloWorld
q1 ------------> Waiting 4000ms
```

## Example 5

Send this request 3 times.

```bash
curl -X 'GET' \
  'http://localhost:8088/rabbitmq/direct-exchange?message=HelloWorld&routingKey=log2&expiration=5000' \
  -H 'accept: */*'
```

- q2 `x-message-ttl` equal 3000ml.
- q2 `prefetch count` equal 2.
- Each message need 4000ms to execute in q1.
- The expiration for each message is 5000 and 5000 greater than 3000, so the `x-message-ttl` will be override by message expiration time, so q2 will receive all messages.

```text
Message: HelloWorld RoutingKey: log2
q2 ------------> Received Message: HelloWorld
q2 ------------> Waiting 4000ms
Message: HelloWorld RoutingKey: log2
Message: HelloWorld RoutingKey: log2
q2 ------------> Received Message: HelloWorld
q2 ------------> Waiting 4000ms
q2 ------------> Received Message: HelloWorld
q2 ------------> Waiting 4000ms
```