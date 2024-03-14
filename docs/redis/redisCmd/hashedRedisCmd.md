---
sidebar_position: 4
---

# HASHED CMD

## HSET

The `HSET` command is used to set the value of a field in a hash.

```redis
HSET key field value
```

- `key`: The name of the hash key.
- `field`: The name of the field within the hash.
- `value`: The value to associate with the field.

Example:

```redis
127.0.0.1:6379> HSET user:1 name ayah age 27 country jordan "job description" "backend develper"
(integer) 4
127.0.0.1:6379> HSET user:2 name sham age 24 country jordan "job description" "backend develper"
(integer) 4
127.0.0.1:6379> HSET user:3 name nour age 22 country jordan "job description" "backend develper"
(integer) 4
```

```
       _____ 1 ----> "name":"ayah", "age":"27", "country":"jordan", "job description":"backend develper"
      |
user__|_____ 2 ----> "name":"sham", "age":"24", "country":"jordan", "job description":"backend develper"
      |
      |_____ 3 ----> "name":"nour", "age":"22", "country":"jordan", "job description":"backend develper"
```

## HGET

The `HGET` command is used to get the value associated with a field in a hash.

```redis
HGET key field
```

- `key`: The name of the hash key.
- `field`: The name of the field within the hash.

Example:

```redis
127.0.0.1:6379> hget user:1 name
"ayah"
127.0.0.1:6379> hget user:2 age
"27"
127.0.0.1:6379> hget user:3 country
"jordan"
```

## HGETALL

The `HGETALL` command is used to get all fields and values of a hash.

```redis
HGETALL key
```

- `key`: The name of the hash key.

Example:

```redis
127.0.0.1:6379> HGETALL user:1
1) "name"
2) "ayah"
3) "age"
4) "27"
5) "country"
6) "jordan"
7) "job description"
8) "backend develper"
127.0.0.1:6379> HGETALL user:2
1) "name"
2) "sham"
3) "age"
4) "24"
5) "country"
6) "jordan"
7) "job description"
8) "backend develper"
127.0.0.1:6379> HGETALL user:3
1) "name"
2) "nour"
3) "age"
4) "22"
5) "country"
6) "jordan"
7) "job description"
8) "backend develper"
```

## HDEL

The `HDEL` command is used to delete one or more fields from a hash.

```redis
HDEL key field [field ...]
```

- `key`: The name of the hash key.
- `field`: The name of the field(s) to delete from the hash.

Example:

```redis
127.0.0.1:6379> hdel user:3 country "job description"
(integer) 2
127.0.0.1:6379> HGETALL user:3
1) "name"
2) "nour"
3) "age"
4) "22"
127.0.0.1:6379> hdel user:3 country "job description"
(integer) 0
```

## HKEYS

the `HKEYS` command is used to retrieve all the field names (keys) of a hash. 

Here's the syntax:

```
HKEYS key
```

- `key`: The name of the hash key.

This command returns a list of all field names (keys) associated with the specified hash.

Example:

```redis
127.0.0.1:6379> hkeys user:1
1) "name"
2) "age"
3) "country"
4) "job description"
127.0.0.1:6379> hkeys user:3
1) "name"
2) "age"
```

## HSCAN
the `HSCAN` command is used to incrementally iterate over the fields and values of a hash data structure. 

Here's the syntax:

```
HSCAN key cursor [MATCH pattern] [COUNT count]
```

- `key`: The name of the hash key.
- `cursor`: An integer used to iterate over the hash. Initially, this should be set to 0.
- `MATCH pattern` (optional): A pattern to match field names against.
- `COUNT count` (optional): The number of elements to return in a single iteration (default is 10).

The `HSCAN` command returns a cursor and an array of field-value pairs. The cursor is used for subsequent iterations until it returns 0, indicating the end of the iteration.


```redis
HSCAN user:id:1001 0
```

Example:

```
127.0.0.1:6379> HSCAN user:1 0 MATCH *r* COUNT 1
1) "0"
2) 1) "country"
   2) "jordan"
   3) "job description"
   4) "backend develper"
127.0.0.1:6379> HSCAN user:2 0 MATCH name
1) "0"
2) 1) "name"
   2) "sham"
```

The cursor returned is "0", indicating that there are no more elements to scan.

