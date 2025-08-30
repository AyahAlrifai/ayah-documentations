---
sidebar_position: 5
---

# @Around

The `@Around` annotation in Spring AOP defines a type of advice known as "around advice." This is the most powerful and flexible type of advice, as it allows you to control the execution of the join point (method) itself. With `@Around` advice, you can choose to proceed with the original method call, modify its arguments, change its return value, or even skip it entirely.

### Key Points of `@Around` Advice

- **Purpose**: To wrap the execution of a join point, giving you control over whether to proceed with the original method, modify its inputs or outputs, or perform additional operations before and after the method call.
- **Target**: Methods that match the pointcut expression.
- **Usage**: Typically used for complex scenarios like transaction management, performance monitoring, or implementing custom logic that requires fine-grained control over method execution.

### How to Use `@Around` Advice

1. **Define a Pointcut**: Specify where the advice should be applied using pointcut expressions.
2. **Implement Advice Method**: Write the method with the `@Around` annotation. This method must accept a `ProceedingJoinPoint` parameter to control the execution of the join point.

### Example

Suppose you want to measure the execution time of any method in a service class and log it. Here’s how you can do it with `@Around` advice:

1. **Define the Aspect**:

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Around;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceAspect {

    @Around("execution(* com.example.service.*.*(..))")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        // Proceed with the original method call
        Object result = joinPoint.proceed();

        long endTime = System.currentTimeMillis();
        System.out.println("Method " + joinPoint.getSignature().toShortString() + " executed in " + (endTime - startTime) + " milliseconds");

        return result; // Return the result of the original method call
    }
}
```