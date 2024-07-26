---
sidebar_position: 11
---

# @Before Advice

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * example 10
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "execution(* com.ayah.aop.service.*.*(..))")
    public void executionAllMethod() {
    }

    @Before(value = "executionAllMethod()")
    public void before(JoinPoint joinPoint) {
        System.out.println("Before -> " + joinPoint.getSignature().getName());

        Object[] args = joinPoint.getArgs();
        System.out.println("Before -> " + args[0] + " " + args[1]);
    }
}
```

## Output

```
    Before -> test1
    Before -> Ayah Al-Refai
    AspectService1 -> test1 -> Ayah Al-Refai
    ##########################################
    Before -> test2
    Before -> 7 5
    AspectService1 -> test2 -> 12
    #############################################
    Before -> test1
    Before -> Al-Refai Ayah
    AspectService2 -> test1 -> Al-Refai Ayah
    #############################################3
    Before -> test2
    Before -> 2 8
    AspectService2 -> test2 -> 10
```