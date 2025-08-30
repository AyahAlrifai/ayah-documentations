---
sidebar_position: 3
---

# Topic Exchange

## Example 1
```bash
curl --location 'http://localhost:8088/rabbitmq/topic-exchange?message=hello%20world&routingKey=ayah.log1.log'
```

```text
Message: hello world RoutingKey: ayah.log1.log
q3 ------------> Received Message: hello world
q1 ------------> Received Message: hello world
```

## Example 2
```bash
curl --location 'http://localhost:8088/rabbitmq/topic-exchange?message=hello%20world&routingKey=ayah.log2.log'
```

```text
Message: hello world RoutingKey: ayah.log2.log
q4 ------------> Received Message: hello world
q2 ------------> Received Message: hello world
q3 ------------> Received Message: hello world
```