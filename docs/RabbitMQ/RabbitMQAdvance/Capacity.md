---
sidebar_position: 4
---

# Capacity

## Example 1

```bash
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=1&routingKey=log5&expiration=0' \
--header 'accept: */*'
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=2&routingKey=log5&expiration=0' \
--header 'accept: */*'
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=3&routingKey=log5&expiration=0' \
--header 'accept: */*'
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=4&routingKey=log5&expiration=0' \
--header 'accept: */*'
curl --location 'http://localhost:8088/rabbitmq/direct-exchange?message=5&routingKey=log5&expiration=0' \
--header 'accept: */*'
```

```text
Message: 1 RoutingKey: log5
q5 ------------> Received Message: 1
q5 ------------> Waiting 10000ms
Message: 2 RoutingKey: log5
Message: 3 RoutingKey: log5
Message: 4 RoutingKey: log5
q5 ------------> Received Message: 2
q5 ------------> Waiting 10000ms
Message: 5 RoutingKey: log5
q5 ------------> Received Message: 5
q5 ------------> Waiting 10000ms
```