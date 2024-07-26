---
sidebar_position: 4
---

# @AfterThrowing

The `@AfterThrowing` annotation in Spring AOP is used to define a type of advice known as "after throwing advice." This advice is executed when a join point (typically a method execution) throws an exception. It allows you to handle exceptions in a centralized manner, perform logging, or take corrective actions when errors occur.

### Key Points of `@AfterThrowing` Advice

- **Purpose**: To execute code when a method throws an exception. It is useful for exception handling, logging errors, and performing specific actions in case of failures.
- **Target**: Methods that match the pointcut expression and throw an exception.
- **Usage**: Typically used to log exceptions, clean up resources, or perform recovery actions.

### How to Use `@AfterThrowing` Advice

1. **Define a Pointcut**: Specify where the advice should be applied using pointcut expressions.
2. **Implement Advice Method**: Write the method with the `@AfterThrowing` annotation and provide the logic to handle the exception.

### Example

Let’s say you want to log details of any exception thrown by methods in a service class. Here’s how you can do it with `@AfterThrowing` advice:

1. **Define the Aspect**:

```java
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.AfterThrowing;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ErrorLoggingAspect {

    @AfterThrowing(pointcut = "execution(* com.example.service.*.*(..))", throwing = "ex")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable ex) {
        System.out.println("After throwing advice: " + joinPoint.getSignature().toShortString());
        System.out.println("Exception: " + ex.getMessage());
    }
}
```