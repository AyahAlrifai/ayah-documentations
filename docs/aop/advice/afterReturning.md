---
sidebar_position: 3
---

# @AfterReturning

The `@AfterReturning` annotation in Spring AOP is used to define a type of advice known as "after returning advice." This advice is executed after a join point (typically a method execution) completes successfully, i.e., the method returns a result without throwing an exception. It allows you to perform actions based on the return value of the method.

### Key Points of `@AfterReturning` Advice

- **Purpose**: To execute code after the join point completes successfully. It is often used for tasks like logging method results, modifying the return value, or performing additional processing based on the method’s return value.
- **Target**: Methods that match the pointcut expression and complete without throwing an exception.
- **Usage**: Typically used to perform operations that depend on the result of the method execution.

### How to Use `@AfterReturning` Advice

1. **Define a Pointcut**: Specify where the advice should be applied using pointcut expressions.
2. **Implement Advice Method**: Write the method with the `@AfterReturning` annotation and provide the logic that should execute after the method successfully returns.

### Example

Let’s say you want to log the result of any method in a service class after it completes successfully. Here’s how you can do it with `@AfterReturning` advice:

1. **Define the Aspect**:

```java
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.AfterReturning;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("After returning advice: " + joinPoint.getSignature().toShortString());
        System.out.println("Returned value: " + result);
    }
}
```