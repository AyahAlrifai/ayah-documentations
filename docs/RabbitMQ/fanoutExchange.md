---
sidebar_position: 5
---

# Fanout Exchange

## Example 1
```bash
curl --location 'http://localhost:8088/rabbitmq/fanout-exchange?message=hello%20world'
```

```text
Message: hello world
q1 ------------> Received Message: hello world
q4 ------------> Received Message: hello world
q2 ------------> Received Message: hello world
q3 ------------> Received Message: hello world
```
