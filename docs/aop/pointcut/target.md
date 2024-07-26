---
sidebar_position: 4
---

# Target 

The `target()` pointcut designator in Aspect-Oriented Programming (AOP) matches join points where the target object is an instance of the specified type. This pointcut is useful when you want to apply advice based on the runtime type of the target object, rather than the proxy object or the declaring type.

### Syntax

```java
target(type)
```

- **type**: The fully qualified name of the type to match.

### Example

```java
@Pointcut(value = "target(com.ayah.aop.service.AspectService)")
public void executionAllMethod() {
}
```

**`com.ayah.aop.service.AspectService`**:
   - This specifies the fully qualified name of the class or interface. In this case, it refers to the type `AspectService` within the package `com.ayah.aop.service`.