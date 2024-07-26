---
sidebar_position: 2
---

# Within 

The `within()` pointcut designator in Aspect-Oriented Programming (AOP) is used to match join points within certain types. This pointcut is particularly useful for applying advice to all methods within a specific class or package.

### Syntax

```java
within(type-pattern)
```

- **type-pattern**: A pattern that specifies the types (classes or interfaces) whose join points should be matched. This can be a fully qualified class name, a package name with a wildcard, or other type pattern expressions.

### Example

```java
@Pointcut(value = "within(com.ayah.aop.service.*)")
public void executionAllMethod() {
}
```

**`com.ayah.aop.service.*`**:
   - This denotes the package com.ayah.aop.service and all the classes within that package.
   - The asterisk (`*`) is a wildcard that matches any class within the specified package.