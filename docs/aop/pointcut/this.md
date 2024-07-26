---
sidebar_position: 3
---

# This 

The `this()` pointcut designator in Aspect-Oriented Programming (AOP) matches join points where the proxy object (i.e., the object that Spring AOP uses to implement aspects) is an instance of the given type. This is useful for applying aspects based on the proxy's type rather than the target object's type.

### Syntax

```java
this(type)
```

- **type**: The fully qualified name of the type to match.

### Example

```java
@Pointcut(value = "this(com.ayah.aop.service.AspectService1)")
public void executionAllMethod() {
}
```

**`com.ayah.aop.service.AspectService1`**:
   - This is the fully qualified name of the class or interface. In this case, it refers specifically to the type `AspectService1` within the package `com.ayah.aop.service`.
