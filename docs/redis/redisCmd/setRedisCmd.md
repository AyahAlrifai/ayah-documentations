---
sidebar_position: 2
---
# SET CMD

## UNSORTED SET CMD

### SADD

The `SADD` command is used to add one or more members to a set.

```redis
SADD key member [member ...]
```

- `key`: The name of the set key.
- `member`: The member(s) to add to the set.

Example:

```redis
127.0.0.1:6379> SADD s1 1 2 3 4 5 6
(integer) 6
127.0.0.1:6379> SADD s2 "jod" "kwd" "usd"
(integer) 3
127.0.0.1:6379> sadd s1 7
(integer) 1
127.0.0.1:6379> sadd s2 "AED"
(integer) 1
```

### SPOP

The `SPOP` command is used to remove and return a random member from a set.

```redis
SPOP key [count]
```

- `key`: The name of the set key.
- `count` (optional): The number of members to pop from the set. If not specified, it removes and returns a single random member.

Example:

```redis
127.0.0.1:6379> SPOP s1
"4"
127.0.0.1:6379> SPOP s1
"2"
127.0.0.1:6379> SPOP s2 2
1) "jod"
2) "AED"
```

### SMOVE

The `SMOVE` command is used to move a member from one set to another.

```redis
SMOVE source destination member
```

- `source`: The name of the source set.
- `destination`: The name of the destination set.
- `member`: The member to move from the source set to the destination set.

Example:

```redis
127.0.0.1:6379> smove s1 s2 1
(integer) 1
127.0.0.1:6379> smove s2 s1 "kwd"
(integer) 1
```

### SSCAN

The `SSCAN` command is used to incrementally iterate over the members of a set.

```redis
SSCAN key cursor [MATCH pattern] [COUNT count]
```

- `key`: The name of the set key.
- `cursor`: An integer used to iterate over the set. Initially, this should be set to 0.
- `[MATCH pattern]` (optional): A pattern to match members against.
- `[COUNT count]` (optional): The number of members to return in a single iteration (default is 10).

Example:

```redis
127.0.0.1:6379> sadd s2 "kwd" "jod" "usd" "aed" "zar" "all"
(integer) 5
127.0.0.1:6379> SSCAN s2 0
1) "0"
2) 1) "usd"
   2) "1"
   3) "kwd"
   4) "jod"
   5) "aed"
   6) "zar"
   7) "all"
127.0.0.1:6379> SSCAN s2 0 match *d
1) "0"
2) 1) "usd"
   2) "kwd"
   3) "jod"
   4) "aed"
```

### SRANDMEMBER

The `SRANDMEMBER` command is used to return one or more random members from a set.

```redis
SRANDMEMBER key [count]
```

- `key`: The name of the set key.
- `count` (optional): The number of random members to return. If positive, it returns an array of unique random members. If negative, it may return the same member multiple times.

Example:

```redis
127.0.0.1:6379> SRANDMEMBER s2 2
1) "aed"
2) "zar"
127.0.0.1:6379> SSCAN s2 0
1) "0"
2) 1) "usd"
   2) "1"
   3) "kwd"
   4) "jod"
   5) "aed"
   6) "zar"
   7) "all"
```
## SORTED SET CMD
Sorted sets in Redis are represented by the data structure ZSET. Here are some common commands used to manipulate sorted sets:

### ZADD

The `ZADD` command in Redis is used to add one or more members to a sorted set, or update the score of existing members if they already exist.

Here's the syntax:

```
ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]
```

- `key`: The name of the sorted set key.
- `[NX|XX]`: Optional. If `NX` is specified, the command only adds new elements, and if `XX` is specified, it only updates existing elements. By default, if neither is specified, new elements are added and existing elements are updated.
- `[GT|LT]`: Optional. Used to specify conditions for adding or updating elements based on their scores. `GT` adds or updates elements if their scores are greater than the provided score, and `LT` does so for scores less than the provided score.
- `[CH]`: Optional. If specified, the command returns the number of elements added or updated. If not specified, it returns only the number of elements added.
- `[INCR]`: Optional. If specified, the command updates the score of the member and returns its new score. If not specified, the score is simply updated or the member is added with the specified score.
- `score`: The score associated with the member. It must be a floating-point number.
- `member`: The member to add or update in the sorted set.

Examples:

1. Adding members to a sorted set:

```redis
127.0.0.1:6379> ZADD ss1 1 "N1" 2 "N2"
(integer) 2
```

2. Adding a member with a specific score:

```redis
127.0.0.1:6379> ZADD ss1 2.5 "N3"
(integer) 1
```

3. Only add a member if it doesn't already exist:

```redis
127.0.0.1:6379> ZADD ss1 NX 3 "N3" 4 "N4"
(integer) 1 // ADD N4 BECUASE N3 IS ALREADY EXIST
```

4. Update the score of a member:

```redis
127.0.0.1:6379> ZADD ss1 CH 3 "N3"
(integer) 1 // THE SCORE OF N3 IS 3
```

5. Update scores of multiple members and return their new scores:

```redis
127.0.0.1:6379> ZADD ss1 INCR 3 "N3"
"6"
127.0.0.1:6379> ZADD ss1 INCR 3 "N1"
"4"```

### ZRANGE
The `ZRANGE` command in Redis is used to retrieve a range of members from a sorted set based on their positions in the sorted set.

Here's the syntax:

```
ZRANGE key start stop [BYSCORE|BYLEX] [REV] [LIMIT offset count] [WITHSCORES]
```

- `key`: The name of the sorted set key.
- `start`: The start index of the range.
- `stop`: The stop index of the range.
- `[BYSCORE|BYLEX]`: Optional. If `BYSCORE` is specified, the range is based on member scores. If `BYLEX` is specified, the range is based on lexicographical order.
- `[REV]`: Optional. If specified, the members are returned in reverse order.
- `[LIMIT offset count]`: Optional. Allows specifying a limit to the number of elements returned, starting from the specified offset.
- `[WITHSCORES]`: Optional. If specified, returns the scores along with the members.

Examples:

1. Retrieve all members in ascending order:

```redis
127.0.0.1:6379> ZRANGE ss1 0 -1
1) "N2"
2) "N1"
3) "N4"
4) "N3"
```

2. Retrieve members with scores in descending order:

```redis
127.0.0.1:6379> ZRANGE ss1 0 -1 WITHSCORES REV
1) "N3"
2) "6"
3) "N4"
4) "4"
5) "N1"
6) "4"
7) "N2"
8) "2"
```

3. Retrieve members with scores between 1 and 4:

```redis
127.0.0.1:6379> ZRANGE ss1 2 4 BYSCORE
1) "N2"
2) "N1"
3) "N4"
// SCORE BETWEEN 2 AND 4
```

4. Retrieve members with scores between 1 and 4, limiting to 2 results start from index 1:

```redis
127.0.0.1:6379> ZRANGE ss1 2 4 BYSCORE LIMIT 1 2
1) "N1"
2) "N4"
```

### ZREM

The `ZREM` command is used to remove one or more members from a sorted set.

```redis
ZREM key member [member ...]
```

- `key`: The name of the sorted set key.
- `member`: The member(s) to remove from the sorted set.

Example:

```redis
127.0.0.1:6379> ZREM ss1 "N1"
(integer) 1
127.0.0.1:6379> ZRANGE ss1 0 -1
1) "N2"
2) "N4"
3) "N3"
```

### ZSCORE

The `ZSCORE` command is used to retrieve the score of a member in a sorted set.

```redis
ZSCORE key member
```

- `key`: The name of the sorted set key.
- `member`: The member for which to retrieve the score.

Example:

```redis
127.0.0.1:6379> ZSCORE ss1 "N2"
"2"
```

### ZRANK and ZREVRANK

The `ZRANK` and `ZREVRANK` commands are used to retrieve the rank of a member in a sorted set (ascending and descending order, respectively).

```redis
ZRANK key member
ZREVRANK key member
```

- `key`: The name of the sorted set key.
- `member`: The member for which to retrieve the rank.

Example:

```redis
127.0.0.1:6379> ZRANK ss1 "N2" WITHSCORE
1) (integer) 0 // INDEX 0
2) "2"
127.0.0.1:6379> ZRANK ss1 "N4" WITHSCORE
1) (integer) 1 // INDEX 1
2) "4"
127.0.0.1:6379> ZRANK ss1 "N3" WITHSCORE
1) (integer) 2 // INDEX 2
2) "6"
```
