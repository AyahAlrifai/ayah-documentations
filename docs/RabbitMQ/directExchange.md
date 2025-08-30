---
sidebar_position: 2
---

# Direct Exchange

## Example 1
```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=hello%20world1&routingKey=log1'
```

```text
Message: hello world1 RoutingKey: log1
q1 ------------> Received Message: hello world1
```

## Example 2
```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=hello%20world2&routingKey=log2'
```

```text
Message: hello world2 RoutingKey: log2
q2 ------------> Received Message: hello world2
```

## Example 3
```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=hello%20world3&routingKey=log3'
```

```text
Message: hello world3 RoutingKey: log3
q3 ------------> Received Message: hello world3
```

## Example 4
```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=hello%20world4&routingKey=log4'
```

```text
Message: hello world4 RoutingKey: log4
q4 ------------> Received Message: hello world4
```

## Example 5
```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=hello%20world5&routingKey=log0'
```

```text
Message: hello world5 RoutingKey: log0
```