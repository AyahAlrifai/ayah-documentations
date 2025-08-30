---
sidebar_position: 8
---

# Args Pointcut

## TestAspect.java

```java
package com.ayah.aop.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

/**
 * example 7
 */
@Aspect
@Component
public class TestAspect {

    @Pointcut(value = "args(Integer,Integer)")
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
    AspectService1 -> test1 -> Ayah Al-Refai
    ##################################################################################
    Around-Before ->Integer com.ayah.aop.service.AspectService1.test2(Integer,Integer)
    Before ->Integer com.ayah.aop.service.AspectService1.test2(Integer,Integer)
    AspectService1 -> test2 -> 12
    After ->Integer com.ayah.aop.service.AspectService1.test2(Integer,Integer)
    Around-After ->Integer com.ayah.aop.service.AspectService1.test2(Integer,Integer)
    #################################################################################
    AspectService2 -> test1 -> Al-Refai Ayah
    ##################################################################################
    Around-Before ->Integer com.ayah.aop.service.AspectService2.test2(Integer,Integer)
    Before ->Integer com.ayah.aop.service.AspectService2.test2(Integer,Integer)
    AspectService2 -> test2 -> 10
    After ->Integer com.ayah.aop.service.AspectService2.test2(Integer,Integer)
    Around-After ->Integer com.ayah.aop.service.AspectService2.test2(Integer,Integer)
```