---
sidebar_position: 3
---

# Execution Pointcut 2

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

/**
 * example 2
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "execution(* com.ayah.aop.service.*.*(String,..))")
    public void executionAllMethod() {
    }

    @Before(value = "executionAllMethod()")
    public void before(JoinPoint joinPoint) {
        System.out.println("Before ->" + joinPoint.getSignature());
    }

    @After(value = "executionAllMethod()")
    public void after(JoinPoint joinPoint) {
        System.out.println("After ->" + joinPoint.getSignature());
    }

    @Around(value = "executionAllMethod()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("Around-Before ->" + joinPoint.getSignature());
        Object result = joinPoint.proceed();
        System.out.println("Around-After ->" + joinPoint.getSignature());
        return result;
    }
}
```

## Output

```
    Around-Before ->String com.ayah.aop.service.AspectService1.test1(String,String)
    Before ->String com.ayah.aop.service.AspectService1.test1(String,String)
    AspectService1 -> test1 -> Ayah Al-Refai
    After ->String com.ayah.aop.service.AspectService1.test1(String,String)
    Around-After ->String com.ayah.aop.service.AspectService1.test1(String,String)
    #######################################################################3#####
    AspectService1 -> test2 -> 12
    #############################################################################
    Around-Before ->String com.ayah.aop.service.AspectService2.test1(String,String)
    Before ->String com.ayah.aop.service.AspectService2.test1(String,String)
    AspectService2 -> test1 -> Al-Refai Ayah
    After ->String com.ayah.aop.service.AspectService2.test1(String,String)
    Around-After ->String com.ayah.aop.service.AspectService2.test1(String,String)
    #############################################################################
    AspectService2 -> test2 -> 10
```