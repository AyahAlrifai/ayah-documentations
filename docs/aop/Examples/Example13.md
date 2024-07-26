---
sidebar_position: 14
---

# @Around Advice

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * example 13
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "execution(* com.ayah.aop.service.*.*(..))")
    public void executionAllMethod() {
    }

    @Around("executionAllMethod()")
    public Object before(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        System.out.println("Around -> Before -> " + args[0] + " " + args[1]);

        if (joinPoint.getSignature().getName().equals("test1")) {
            args[0] = "*" + args[0];
            args[1] = args[1] + "*";
        } else if (joinPoint.getSignature().getName().equals("test2")) {
            args[0] = (Integer) args[0] + 100;
            args[1] = (Integer) args[1] + 100;
        }

        Object result = joinPoint.proceed(args);

        System.out.println("Around -> After -> " + args[0] + " " + args[1]);
        return result;

    }
}
```

## Output

```
    Around -> Before -> Ayah Al-Refai
    AspectService1 -> test1 -> *Ayah Al-Refai*
    Around -> After -> *Ayah Al-Refai*
    ################################################
    Around -> Before -> 7 5
    AspectService1 -> test2 -> 212
    Around -> After -> 107 105
    #################################################
    Around -> Before -> Al-Refai Ayah
    AspectService2 -> test1 -> *Al-Refai Ayah*
    Around -> After -> *Al-Refai Ayah*
    ################################################
    Around -> Before -> 2 8
    AspectService2 -> test2 -> 210
    Around -> After -> 102 108
```