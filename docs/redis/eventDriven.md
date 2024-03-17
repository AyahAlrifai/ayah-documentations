---
sidebar_position: 3
---
import ReactPlayer from 'react-player';
import MyVideoUrl from './video/example.mp4';

# Event Driven

## Message Queue

### SUBSCRIBE

This command subscribes the client to the specified channels. Once subscribed, the client will receive messages published to those channels.

Syntax:
```
SUBSCRIBE channel [channel ...]
```

- `channel`: The name of the channel(s) to subscribe to.

Example:
```redis
SUBSCRIBE channel1 channel2
```

### UNSUBSCRIBE

This command unsubscribes the client from the specified channels. If no channels are specified, the client is unsubscribed from all channels.

Syntax:
```
UNSUBSCRIBE [channel [channel ...]]
```

- `channel`: The name of the channel(s) to unsubscribe from.

Example:
```redis
UNSUBSCRIBE channel1
```

### PSUBSCRIBE

This command subscribes the client to channels that match the specified patterns. The client will receive messages published to channels that match the patterns.

Syntax:
```
PSUBSCRIBE pattern [pattern ...]
```

- `pattern`: The pattern(s) to subscribe to.

Example:
```redis
PSUBSCRIBE channel*
```

### PUNSUBSCRIBE

This command unsubscribes the client from channels that match the specified patterns. If no patterns are specified, the client is unsubscribed from all channels matching any pattern previously subscribed to.

Syntax:
```
PUNSUBSCRIBE [pattern [pattern ...]]
```

- `pattern`: The pattern(s) to unsubscribe from.

Example:
```redis
PUNSUBSCRIBE channel*
```

### PUBLISH

This command publishes a message to the specified channel.

Syntax:
```
PUBLISH channel message
```

- `channel`: The name of the channel to publish the message to.
- `message`: The message to publish.

Example:
```redis
PUBLISH channel1 "Hello, Redis!"
```
### EXAMPLE

<ReactPlayer controls height="100%" url={MyVideoUrl} width="100%" />

1. sub1
   ```redis
   127.0.0.1:6379> SUBSCRIBE CHANNEL_1_0 CHANNEL_1_1
   1) "subscribe"
   2) "CHANNEL_1_0"
   3) (integer) 1
   1) "subscribe"
   2) "CHANNEL_1_1"
   3) (integer) 2
   1) "message"
   2) "CHANNEL_1_0"
   3) "HELLO CHANNEL 1 0"
   1) "message"
   2) "CHANNEL_1_1"
   3) "HELLO CHANNEL 1 1"
   Reading messages... (
   ```

2. sub2
   ```redis
   127.0.0.1:6379> SUBSCRIBE CHANNEL_1_0
   1) "subscribe"
   2) "CHANNEL_1_0"
   3) (integer) 1
   1) "message"
   2) "CHANNEL_1_0"
   3) "HELLO CHANNEL 1 0"
   Reading messages... (press Ctrl-C to quit or any key to type command)       
   ```

3. sub3
   ```redis
   127.0.0.1:6379> PSUBSCRIBE CHANNEL_1_*
   1) "psubscribe"
   2) "CHANNEL_1_*"
   3) (integer) 1
   1) "pmessage"
   2) "CHANNEL_1_*"
   3) "CHANNEL_1_0"
   4) "HELLO CHANNEL 1 0"
   1) "pmessage"
   2) "CHANNEL_1_*"
   3) "CHANNEL_1_1"
   4) "HELLO CHANNEL 1 1"
   1) "pmessage"
   2) "CHANNEL_1_*"
   3) "CHANNEL_1_3"
   4) "HELLO CHANNEL 1 3"
   Reading messages... (press Ctrl-C to quit or any key to type command)       
   ```

4. pub
   ```redis
   127.0.0.1:6379> PUBLISH CHANNEL_1_0 "HELLO CHANNEL 1 0"
   (integer) 3
   127.0.0.1:6379> PUBLISH CHANNEL_1_1 "HELLO CHANNEL 1 1"
   (integer) 2
   127.0.0.1:6379> PUBLISH CHANNEL_1_3 "HELLO CHANNEL 1 3"
   (integer) 1
   127.0.0.1:6379>
   ```