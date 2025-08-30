---
sidebar_position: 4
---

# Headers Exchange

## Headers Exchange Basic

#### Example 1
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange?message=hello%20world&type=email'
```

```text
Message: hello world Type: email
q2 ------------> Received Message: hello world
```

#### Example 2

```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange?message=hello%20world&type=message'
```

```text
Message: hello world Type: message
q1 ------------> Received Message: hello world
```

#### Example 3
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange?message=hello%20world&type=notification'
```

```text
Message: hello world Type: notification
q3 ------------> Received Message: hello world
```

#### Example 4
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange?message=hello%20world&type=sms'
```

```text
Message: hello world Type: sms
q4 ------------> Received Message: hello world
```

#### Example 5
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange?message=hello%20world&type=mms'
```

```text
Message: hello world Type: mms
```

## Headers Exchange With x-match

#### Example 1
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange-x-match?message=hello%20world&type=message&count=0'
```

```text
Message: hello world Type: message Count: 0
q3 ------------> Received Message: hello world
q1 ------------> Received Message: hello world
```

#### Example 2

```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange-x-match?message=hello%20world&type=sms&count=1'
```

```text
Message: hello world Type: sms Count: 1
q1 ------------> Received Message: hello world
q4 ------------> Received Message: hello world
```

#### Example 3
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange-x-match?message=hello%20world&type=message&count=1'
```

```text
Message: hello world Type: message Count: 1
q2 ------------> Received Message: hello world
q1 ------------> Received Message: hello world
q3 ------------> Received Message: hello world
q4 ------------> Received Message: hello world
```

#### Example 4
```bash
curl --location 'http://localhost:8088/rabbitmq/header-exchange-x-match?message=hello%20world&type=sms&count=0'
```

```text
Message: hello world Type: sms Count: 0
```