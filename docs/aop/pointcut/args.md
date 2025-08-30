---
sidebar_position: 5
---

# Args 

In Spring AOP, the `args` pointcut expression is used to match method join points based on the types of arguments passed to the methods. This allows you to apply advice only to methods where the arguments match certain types.

### Key Points of `args` Pointcut Expression

- **Purpose**: To target methods based on the types of arguments they receive.
- **Target**: Methods with arguments of specified types.
- **Usage**: Useful when you want to apply advice only to methods that take certain types of parameters or to check the types of arguments before executing advice.

### Syntax

The `args` pointcut expression is defined with a comma-separated list of argument types. For example:

```java
@Pointcut("args(arg1Type, arg2Type, ...)")
public void pointcutName() {}
```

- **`arg1Type`**: The type of the first argument.
- **`arg2Type`**: The type of the second argument, and so on.

### Example

```java
@Pointcut(value = "args(Integer,Integer)")
public void executionAllMethod() {
}
```

**`args(Integer,Integer)`**:
   - This pointcut expression specifies that the matched methods should have exactly two parameters of type Integer. It does not specify which methods to match by name or by return type; it only filters based on the method parameters