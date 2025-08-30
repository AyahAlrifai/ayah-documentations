---
sidebar_position: 15
---

# @AfterThrowing Advice

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * example 14
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "execution(* com.ayah.aop.service.AspectService1.test2(..))")
    public void executionAllMethod() {
    }

    @Around("executionAllMethod()")
    public Object before(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        args[0] = null;
        return joinPoint.proceed(args);
    }

    @AfterThrowing(value = "executionAllMethod()",
            throwing = "e")
    public void before(JoinPoint joinPoint, Exception e) {
        System.out.println("AfterThrowing -> " + e.getMessage());
    }
}
```

## Output

```
    AspectService1 -> test1 -> Ayah Al-Refai
    ####################################################################################
    AfterThrowing -> Cannot invoke "java.lang.Integer.intValue()" because "num1" is null
    java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "num1" is null
    at com.ayah.aop.service.AspectService1.test2(AspectService1.java:16) ~[classes/:na]
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77) ~[na:na]
    at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:na]
    at java.base/java.lang.reflect.Method.invoke(Method.java:568) ~[na:na]
    at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:351) ~[spring-aop-6.1.4.jar:6.1.4]
```