---
sidebar_position: 3
---
import ReactPlayer from 'react-player';
import MyVideoUrl from './video/example.mp4';
import MyVideoUrl1 from './video/example1.mp4';

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
```Redis
SUBSCRIBE channel1 channel2
```

### UNSUBSCRIBE

This command unsubscribes the client from the specified channels. If no channels are specified, the client is unsubscribed from all channels.

Syntax:
```Redis
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

## STREAM

### XADD

The `XADD` command in Redis is used to add a new entry (message) to a stream. Below is the syntax of the `XADD` command:

```
XADD key [NOMKSTREAM] [MAXLEN|MINID [=|~] threshold [LIMIT count]] *|id field value [field value ...]
```

- `key`: The name of the stream key.
- `[NOMKSTREAM]`: Optional. Specifies that the stream should not be created automatically if it doesn't exist.
- `[MAXLEN|MINID [=|~] threshold [LIMIT count]]`: Optional. Defines the behavior when the stream reaches a certain length (`MAXLEN`) or when the stream contains messages with IDs lower than a certain value (`MINID`). It allows you to specify a threshold and, optionally, a limit on the number of messages to remove when the condition is met.
  
   - [MAXLEN|MINID]: Specifies whether the condition is based on the maximum length of the stream (MAXLEN) or on the minimum ID allowed in the stream (MINID).

   - [=|~]: Determines whether the threshold is inclusive (=) or exclusive (~).
      - For MAXLEN, = means that if the stream's length equals the threshold, actions are taken, while ~ means if the length surpasses the threshold.
      - For MINID, = means if the ID equals the threshold, and ~ means if the ID is less than the threshold.
   - threshold: The threshold value that triggers the condition.

   - [LIMIT count]: Optionally, specifies the maximum number of messages to remove when the condition is met.

- `*|id`: Specifies the ID of the message. Use `*` to automatically generate an ID, or specify a specific ID.
- `field value [field value ...]`: The fields and their corresponding values to include in the message.

Here's a breakdown of the options:

- `MAXLEN`: Specifies the maximum length of the stream. When the stream reaches this length, old messages are trimmed to maintain the maximum length.
- `MINID`: Specifies the minimum ID allowed in the stream. Messages with IDs lower than the specified ID are removed from the stream.
- `=`: Specifies an inclusive threshold. If the condition is met, the specified number of messages are removed.
- `~`: Specifies an exclusive threshold. If the condition is met, messages with IDs strictly lower than the threshold are removed.
- `LIMIT count`: Specifies the maximum number of messages to remove when the condition is met.

Example:

```redis
127.0.0.1:6379> 20 xadd stream * a a b b c c d d
"1715588710515-0"
"1715588710516-0"
"1715588710516-1"
"1715588710517-0"
"1715588710517-1"
"1715588710517-2"
"1715588710518-0"
"1715588710519-0"
"1715588710519-1"
"1715588710520-0"
"1715588710520-1"
"1715588710521-0"
"1715588710521-1"
"1715588710521-2"
"1715588710522-0"
"1715588710522-1"
"1715588710522-2"
"1715588710523-0"
"1715588710523-1"
"1715588710523-2"
```

### XLEN

The XLEN command in Redis is used to get the length (i.e., the number of elements) of a stream.

Here's the syntax:

```redis
XLEN key
```

Example:

```redis
127.0.0.1:6379> xlen stream
(integer) 20
```

### XRANGE 

The XRANGE command in Redis is used to retrieve a range of messages (entries) from a stream within the specified range of IDs.

Here's the syntax for the XRANGE command:
```redis
XRANGE key start end [COUNT count]
```

- key: The name of the stream key.
- start: The minimum ID (inclusive) of the range.
- end: The maximum ID (inclusive) of the range.
- [COUNT count]: Optional. Specifies the maximum number of messages to return. If not provided, all messages within the specified range are returned.

The XRANGE command returns an array of messages (entries) within the specified range, each message represented as a list containing the message ID and a map of field-value pairs.

Example:

```redis
127.0.0.1:6379> xrange stream 1715588710515 1715588710517
1) 1) "1715588710515-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
2) 1) "1715588710516-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
3) 1) "1715588710516-1"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
4) 1) "1715588710517-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
5) 1) "1715588710517-1"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
6) 1) "1715588710517-2"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
127.0.0.1:6379> xrange stream 1715588710515-1 1715588710517-1
1) 1) "1715588710516-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
2) 1) "1715588710516-1"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
3) 1) "1715588710517-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
4) 1) "1715588710517-1"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
127.0.0.1:6379> xrange stream 1715588710523 +
1) 1) "1715588710523-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
2) 1) "1715588710523-1"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
3) 1) "1715588710523-2"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
127.0.0.1:6379> xrange stream 1715588710523 + count 2
1) 1) "1715588710523-0"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
2) 1) "1715588710523-1"
   2) 1) "a"
      2) "a"
      3) "b"
      4) "b"
      5) "c"
      6) "c"
      7) "d"
      8) "d"
```

### XREAD

The XREAD command in Redis is used to read messages from one or more streams. It allows clients to consume messages from streams in a blocking or non-blocking manner.

Here's the basic syntax:

```redis
XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]

```
- [COUNT count]: Optional. Specifies the maximum number of messages to return per stream.
- [BLOCK milliseconds]: Optional. Specifies the blocking behavior. If provided, the command blocks for the specified amount of time (in milliseconds) until new messages arrive. If not provided, the command returns immediately.
- STREAMS key [key ...]: Specifies the stream(s) to read from.
- ID [ID ...]: Specifies the ID(s) of the last message(s) read from each stream. Use 0 to read from the beginning of the stream.

When XREAD is used with the BLOCK option, it blocks until new messages arrive in the specified streams or until the timeout expires. Without the BLOCK option, it returns immediately with the available messages.


Example:

```redis
127.0.0.1:6379> xread streams stream  1715588710523-1
1) 1) "stream"
   2) 1) 1) "1715588710523-2"
         2) 1) "a"
            2) "a"
            3) "b"
            4) "b"
            5) "c"
            6) "c"
            7) "d"
            8) "d"
127.0.0.1:6379> xread streams stream  1715588710515-0
1) 1) "stream"
   2)  1) 1) "1715588710516-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       2) 1) "1715588710516-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       3) 1) "1715588710517-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       4) 1) "1715588710517-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       5) 1) "1715588710517-2"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       6) 1) "1715588710518-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       7) 1) "1715588710519-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       8) 1) "1715588710519-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
       9) 1) "1715588710520-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      10) 1) "1715588710520-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      11) 1) "1715588710521-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      12) 1) "1715588710521-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      13) 1) "1715588710521-2"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      14) 1) "1715588710522-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      15) 1) "1715588710522-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      16) 1) "1715588710522-2"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      17) 1) "1715588710523-0"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      18) 1) "1715588710523-1"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
      19) 1) "1715588710523-2"
          2) 1) "a"
             2) "a"
             3) "b"
             4) "b"
             5) "c"
             6) "c"
             7) "d"
             8) "d"
```

### Example

<ReactPlayer controls height="100%" url={MyVideoUrl1} width="100%" />

## GROUP
### XGROUP CREATE

The XGROUP CREATE command in Redis is used to create a new consumer group associated with a stream. Consumer groups allow multiple consumers to read from a stream in a coordinated manner, ensuring that each message is consumed by only one member of the group.

Here's the syntax for the XGROUP CREATE command:
```redis
XGROUP CREATE <key> <groupname> <id-or-$> [MKSTREAM]
```

- `<key>`: The name of the stream key.
- `<groupname>`: The name of the consumer group to create.
- `<id-or-$>`: The ID of the last message that was delivered to this consumer group. Use $ to start from the current last message.
- [MKSTREAM]: Optional. If specified, creates the stream if it doesn't exist.


### XGROUP SETID

The XGROUP SETID command in Redis is used to set the last delivered ID for a consumer group. This command is useful when you need to replay messages or skip ahead within a consumer group.

Here's the syntax for the XGROUP SETID command:

```redis
XGROUP SETID <key> <groupname> <id-or-$>
```

- `<key>`: The name of the stream key.
- `<groupname>`: The name of the consumer group.
- `<id-or-$>`: The ID of the last message that was delivered to this consumer group. Use $ to start from the current last message.


### XGROUP DESTROY

The XGROUP DESTROY command in Redis is used to destroy a consumer group and its associated pending messages. Once a consumer group is destroyed, it cannot be used for consuming messages anymore, and any pending messages associated with the group are removed.

Here's the syntax for the XGROUP DESTROY command:

```redis
XGROUP DESTROY <key> <groupname>
```

- `<key>`: The name of the stream key.
- `<groupname>`: The name of the consumer group to destroy.

### XGROUP CREATECONSUMER

The XGROUP CREATECONSUMER command in Redis is used to create a new consumer within a consumer group. This command adds a new consumer to the specified consumer group, allowing the newly created consumer to start consuming messages from the group.

Here's the syntax for the XGROUP CREATECONSUMER command:

```redis
XGROUP CREATECONSUMER <key> <groupname> <consumername>
```
- `<key>`: The name of the stream key.
- `<groupname>`: The name of the consumer group.
- `<consumername>`: The name of the new consumer to create within the consumer group.


### Example

```redis
127.0.0.1:6379> XGROUP CREATE stream g1 $
OK
127.0.0.1:6379> XGROUP CREATE stream g2 $
OK
127.0.0.1:6379> XGROUP CREATE stream g3 $
OK
127.0.0.1:6379> XGROUP CREATECONSUMER stream g1 c1
(integer) 1
127.0.0.1:6379> XGROUP CREATECONSUMER stream g1 c2
(integer) 1
127.0.0.1:6379> XGROUP CREATECONSUMER stream g2 c1
(integer) 1
127.0.0.1:6379> XGROUP CREATECONSUMER stream g2 c2
(integer) 1
127.0.0.1:6379> XGROUP CREATECONSUMER stream g3 c1
(integer) 1
127.0.0.1:6379> XGROUP CREATECONSUMER stream g3 c2
(integer) 1
127.0.0.1:6379> XREADGROUP group g1 c1 block 5000 streams stream 1715603688775-0
```

