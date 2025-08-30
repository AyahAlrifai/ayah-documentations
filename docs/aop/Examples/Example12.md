---
sidebar_position: 13
---

# @AfterReturning Advice

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * example 12
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "execution(* com.ayah.aop.service.*.*(..))")
    public void executionAllMethod() {
    }

    @AfterReturning(value = "executionAllMethod()",
            returning = "result")
    public void before(JoinPoint joinPoint, Object result) {
        System.out.println("AfterReturning -> " + joinPoint.getSignature().getName());

        Object[] args = joinPoint.getArgs();
        System.out.println("AfterReturning -> " + args[0] + " " + args[1]);

        System.out.println("AfterReturning -> Result -> " + result);
    }
}
```

## Output

```
    AspectService1 -> test1 -> Ayah Al-Refai
    AfterReturning -> test1
    AfterReturning -> Ayah Al-Refai
    AfterReturning -> Result -> Ayah Al-Refai
    ################################################
    AspectService1 -> test2 -> 12
    AfterReturning -> test2
    AfterReturning -> 7 5
    AfterReturning -> Result -> 12
    ##############################################
    AspectService2 -> test1 -> Al-Refai Ayah
    AfterReturning -> test1
    AfterReturning -> Al-Refai Ayah
    AfterReturning -> Result -> Al-Refai Ayah
    #############################################
    AspectService2 -> test2 -> 10
    AfterReturning -> test2
    AfterReturning -> 2 8
    AfterReturning -> Result -> 10
```