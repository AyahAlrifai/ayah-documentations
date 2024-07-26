---
sidebar_position: 6
---

# @Annotation 

The `@annotation()` pointcut designator in Aspect-Oriented Programming (AOP) is used to match join points where the subject of the join point (typically a method) is annotated with a specific annotation. This pointcut is useful for applying advice based on annotations present on methods, allowing you to manage cross-cutting concerns like security, transactions, or logging in an annotation-driven manner.

### Syntax

```java
@annotation(annotation-type)
```

- **annotation-type**: The fully qualified name of the annotation type to match.

### Example

```java
@Pointcut(value = "@annotation(com.ayah.aop.annotation.Test)")
public void executionAllMethod() {
}
```

**`com.ayah.aop.annotation.Test`**:
   - This specifies the fully qualified name of the annotation to be matched. In this case, it refers to the `Test` annotation within the package `com.ayah.aop.annotation`.
