---
sidebar_position: 1
---

# @Before

The `@Before` annotation in Spring AOP is used to define a type of advice known as "before advice." This advice is executed before the join point (usually a method execution) is reached. It allows you to perform actions or checks before the actual method logic is executed.

### Key Points of `@Before` Advice

- **Purpose**: To execute code before the join point (e.g., method call). Common uses include logging, security checks, and validation.
- **Target**: Methods that match the pointcut expression.
- **Usage**: Can be applied to any method where you want to insert additional behavior before the actual method execution.

### How to Use `@Before` Advice

1. **Define a Pointcut**: Specify where the advice should be applied using pointcut expressions.
2. **Implement Advice Method**: Write the method with the `@Before` annotation and provide the logic that should execute before the join point.

### Example

```java
@Pointcut(value = "execution(* com.ayah.aop.service.*.*(..))")
public void executionAllMethod() {
}

@Before(value = "executionAllMethod()")
public void before(JoinPoint joinPoint) {
    System.out.println("Before ->" + joinPoint.getSignature());
}
```
Or we can declure pointcut inside `@Before` annotation like this:
```java
@Before(value = "execution(* com.ayah.aop.service.*.*(..))")
public void before(JoinPoint joinPoint) {
    System.out.println("Before ->" + joinPoint.getSignature());
}
```