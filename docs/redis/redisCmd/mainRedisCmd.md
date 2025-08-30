---
sidebar_position: 1
---

# MAIN CMD

## Launch Redis CLI

```powershell
Redis-cli
```

redis has 0-15 database and default database is `0` to select specific database run this comand.

```powershell
Redis-cli -n <i>
Redis-cli -n 10
```

or you can run this command inside redis to move to another database

```powershell
SELECT 10
```

## SET

The `SET` command in Redis is used to set the value of a key. The syntax you provided for the `SET` command is as follows:

```
SET key value [NX|XX] [GET] [EX seconds|PX milliseconds|EXAT unix-time-seconds|PXAT unix-time-milliseconds]
```

Here's what each part means:

- `SET`: This is the command itself, used to set the value of a key.

- `key`: This is the name of the key you want to set.

- `value`: This is the value you want to associate with the key.

- `[NX|XX]`: This is an optional argument that specifies whether to perform the `SET` operation only if the key does not exist (`NX`) or only if the key already exists (`XX`).
  - `NX`: Only set the key if it does not already exist.
  - `XX`: Only set the key if it already exists.

- `[GET]`: This is an optional argument that, if specified, retrieves the value of the key if it is set successfully. If the key does not exist or the `NX` option prevents the `SET` operation, the command returns `nil`.

- `[EX seconds|PX milliseconds|EXAT unix-time-seconds|PXAT unix-time-milliseconds]`: These are optional arguments used to specify the expiration time of the key. You can choose one of the following options:
  - `EX seconds`: Set the key to expire after the specified number of seconds.
  - `PX milliseconds`: Set the key to expire after the specified number of milliseconds.
  - `EXAT unix-time-seconds`: Set the key to expire at the specified UNIX timestamp in seconds.
  - `PXAT unix-time-milliseconds`: Set the key to expire at the specified UNIX timestamp in milliseconds.

Example:

```redis
# redis-cli
127.0.0.1:6379> set name ayah
OK
127.0.0.1:6379> set age 25
OK
127.0.0.1:6379> set "job description" "backend developer"
OK
127.0.0.1:6379> set age 27 XX
OK
127.0.0.1:6379> set name aya NX
(error) ERR syntax error
127.0.0.1:6379> set age 27 xx get
"27"
127.0.0.1:6379> set birthdate 07/MAY/1997 NX get
(nil)
127.0.0.1:6379> set note "this key expire after 10s" EX 10
OK
```

## GET


The `GET` command in Redis is used to retrieve the value associated with a specified key. Its syntax is simple:

```
GET key
```

- `GET`: This is the command itself, used to retrieve the value of a key.
- `key`: This is the name of the key whose value you want to retrieve.

When you execute `GET` followed by the key name, Redis will return the value associated with that key. If the key does not exist or if it is associated with a non-string data type, the command will return `nil`.

Example:

```redis
127.0.0.1:6379> get name
"ayah"
127.0.0.1:6379> get age
"27"
127.0.0.1:6379> get "job description"
"backend developer"
127.0.0.1:6379> get note
"this key expire after 10s"
127.0.0.1:6379> get note
"this key expire after 10s"
127.0.0.1:6379> get note
"this key expire after 10s"
127.0.0.1:6379> get note
"this key expire after 10s"
127.0.0.1:6379> get note
"this key expire after 10s"
127.0.0.1:6379> get note
(nil)
```

## EXPIRE

The `EXPIRE` command in Redis is used to set an expiration time (in seconds) on a key. Once the expiration time has elapsed, the key will be automatically deleted. 

Here's the syntax for the `EXPIRE` command:

```
EXPIRE key seconds
```

- `EXPIRE`: This is the command itself, used to set the expiration time for a key.
- `key`: This is the name of the key for which you want to set the expiration time.
- `seconds`: This is the number of seconds after which the key will expire and be automatically deleted.

Example:

```redis
127.0.0.1:6379> EXPIRE age 10
(integer) 1
127.0.0.1:6379> get age
"27"
127.0.0.1:6379> get age
"27"
127.0.0.1:6379> get age
"27"
127.0.0.1:6379> get age
"27"
127.0.0.1:6379> get age
"27"
127.0.0.1:6379> get age
(nil)
```

## DEL

The `DEL` command in Redis is used to delete a key and its associated value from the database. Its syntax is straightforward:

```
DEL key [key ...]
```

- `DEL`: This is the command itself, used to delete keys.
- `key`: This is the name of the key or keys you want to delete. You can specify multiple keys separated by spaces.

Example:

```redis
127.0.0.1:6379> DEL name "job description"
(integer) 2
127.0.0.1:6379> get name
(nil)
127.0.0.1:6379> get "job description"
(nil)
127.0.0.1:6379> del name
(integer) 0
```

## UNLINK

In Redis, the `UNLINK` command is used to delete a key or keys asynchronously. It is similar to the `DEL` command, but it performs the deletion in a non-blocking manner.

The syntax for the `UNLINK` command is:

```
UNLINK key [key ...]
```

- `UNLINK`: This is the command itself, used to delete keys asynchronously.
- `key`: This is the name of the key or keys you want to delete. You can specify multiple keys separated by spaces.

Example:

```redis
127.0.0.1:6379> set name ayah
OK
127.0.0.1:6379> set age 27
OK
127.0.0.1:6379> set country jordan
OK
127.0.0.1:6379> unlink age
(integer) 1
127.0.0.1:6379> get age
(nil)
127.0.0.1:6379> unlink name country
(integer) 2
127.0.0.1:6379> get name
(nil)
127.0.0.1:6379> get country
(nil)
```

## EXISTS

In Redis, the `EXISTS` command is used to check whether a key or keys exist in the database. Its syntax is:

```
EXISTS key [key ...]
```

- `EXISTS`: This is the command itself, used to check the existence of keys.
- `key`: This is the name of the key or keys you want to check. You can specify multiple keys separated by spaces.

Example:

```redis 
127.0.0.1:6379> set name ayah
OK
127.0.0.1:6379> set age 27
OK
127.0.0.1:6379> set country jordan
OK
127.0.0.1:6379> set "job description" "backend developer"
OK
127.0.0.1:6379> set birthdate 05/MAY/1997
OK
127.0.0.1:6379> exists name
(integer) 1
127.0.0.1:6379> exists name age country
(integer) 3
127.0.0.1:6379> exists note
(integer) 0
127.0.0.1:6379> exists note birthdate
(integer) 1
```

## TYPE

In Redis, the `TYPE` command is used to determine the data type of a key. Its syntax is straightforward:

```
TYPE key
```

- `TYPE`: This is the command itself, used to determine the data type of a key.
- `key`: This is the name of the key for which you want to determine the data type.

The `TYPE` command returns a string indicating the data type of the key. The possible return values are:

- `string`: Indicates that the key holds a string value.
- `list`: Indicates that the key holds a list data structure.
- `set`: Indicates that the key holds a set data structure.
- `zset`: Indicates that the key holds a sorted set (zset) data structure.
- `hash`: Indicates that the key holds a hash data structure.
- `stream`: Indicates that the key holds a stream data structure.

Example:

```redis
127.0.0.1:6379> type name
string
127.0.0.1:6379> type age
string
127.0.0.1:6379> type ordered_set
zset
```

## FLUSHDB

The `FLUSHDB` command in Redis is used to remove all keys from the currently selected database. It effectively clears the entire database of all data. 

The syntax for the `FLUSHDB` command is:

```
FLUSHDB [ASYNC]
```

- `FLUSHDB`: This is the command itself, used to remove all keys from the currently selected database.
- `[ASYNC]`: This is an optional parameter. If specified, it indicates that the deletion operation should be performed asynchronously, allowing the command to return immediately without waiting for the operation to complete.

If you execute `FLUSHDB` without the `[ASYNC]` parameter, it will block until all keys are removed from the database.

Example:

```redis
127.0.0.1:6379> FLUSHDB
OK
127.0.0.1:6379> get name
(nil)
127.0.0.1:6379> get country
(nil)
```