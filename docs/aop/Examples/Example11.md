---
sidebar_position: 12
---

# @After Advice

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * example 11
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "execution(* com.ayah.aop.service.*.*(..))")
    public void executionAllMethod() {
    }

    @After(value = "executionAllMethod()")
    public void before(JoinPoint joinPoint) {
        System.out.println("After -> " + joinPoint.getSignature().getName());

        Object[] args = joinPoint.getArgs();
        System.out.println("After -> " + args[0] + " " + args[1]);
    }
}
```

## Output

```
    AspectService1 -> test1 -> Ayah Al-Refai
    After -> test1
    After -> Ayah Al-Refai
    ##########################################
    AspectService1 -> test2 -> 12
    After -> test2
    After -> 7 5
    ########################################
    AspectService2 -> test1 -> Al-Refai Ayah
    After -> test1
    After -> Al-Refai Ayah
    #######################################
    AspectService2 -> test2 -> 10
    After -> test2
    After -> 2 8
```