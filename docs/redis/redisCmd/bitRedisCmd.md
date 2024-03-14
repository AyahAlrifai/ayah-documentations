---
sidebar_position: 5
---

# BIT CMD

## SETBIT

This command sets or clears the bit at a specified offset in a Redis string. If the offset is beyond the length of the string, the string is automatically extended to accommodate the specified offset.

Syntax:
```
SETBIT key offset value
```

- `key`: The name of the Redis string key.
- `offset`: The bit offset at which to set or clear the bit.
- `value`: The value to set (0 or 1).

Example:

```redis
127.0.0.1:6379> SETBIT b1 5 1
(integer) 1
```

## GETBIT

This command returns the value of a bit at a specified offset in a Redis string.

Syntax:
```
GETBIT key offset
```

- `key`: The name of the Redis string key.
- `offset`: The bit offset whose value is to be retrieved.

Example:
```redis
127.0.0.1:6379> getbit b1 5 // index 5
(integer) 1
127.0.0.1:6379> getbit b1 3 // index 3
(integer) 0
```

```
          0  1  2  3  4  5  6  7
b1 -----> 0  0  0  0  0  1  0  0

```
## STRLEN

This command returns the length of the string value stored at a key. If the key does not exist, it returns 0.

Syntax:
```
STRLEN key
```

- `key`: The name of the Redis string key.

Example:

```redis
127.0.0.1:6379> STRLEN b1
(integer) 1
127.0.0.1:6379> SETBIT b1 9 1
(integer) 1
127.0.0.1:6379> SETBIT b1 7 1
(integer) 1
127.0.0.1:6379> SETBIT b1 3 1
(integer) 1
127.0.0.1:6379> SETBIT b1 10 1
(integer) 1
127.0.0.1:6379> STRLEN b1
(integer) 2 // 2 byte
```

```
          0  1  2  3  4  5  6  7  8 9 10 11 12 13 14 15
b1 -----> 0  0  0  1  0  1  0  1  0 1 1  0  0  0  0  0

```

## BITCOUNT

This command counts the number of set bits (bits with a value of 1) in a Redis string.

Syntax:
```
BITCOUNT key [start end] [BYTE | BIT]
```

- `key`: The name of the Redis string key.
- `[start end]` (optional): The optional range of bytes within the string in which to count the bits.

Example:
```redis
127.0.0.1:6379> BITCOUNT b1
(integer) 5
127.0.0.1:6379> BITCOUNT b1 0 7 BIT
(integer) 3
127.0.0.1:6379> BITCOUNT b1 1 1 BYTE
(integer) 2
```