---
sidebar_position: 1
---

# Excecution 

The `execution()` pointcut designator in Aspect-Oriented Programming (AOP) is used to match method execution join points. This pointcut is highly versatile and allows you to specify a wide range of method characteristics to match.

### Syntax
```java
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern) throws-pattern?)
```
Each part of the expression specifies different characteristics of the methods you want to match:

- **modifiers-pattern?**: Optional pattern to match method modifiers (e.g., `public`, `protected`).
- **ret-type-pattern**: Pattern to match the return type (e.g., `*` for any return type, `void`).
- **declaring-type-pattern?**: Optional pattern to match the type (class/interface) that declares the method.
- **name-pattern**: Pattern to match the method name (e.g., `*` for any method name).
- **param-pattern**: Pattern to match method parameters (e.g., `(..)` for any parameters, `()` for no parameters, `(*, String)` for methods with two parameters where the second is a `String`).
- **throws-pattern?**: Optional pattern to match the exceptions thrown by the method.

### Example

```java
@Pointcut(value = "execution(* com.ayah.aop.service.*.*(..))")
public void executionAllMethod() {
}
```

**`* com.ayah.aop.service.*.*(..)`**:
   - The asterisk (`*`) at the beginning of the expression represents any return type. This means the pointcut does not filter methods based on their return type.
   - `com.ayah.aop.service` is the package name where the methods are located. The pointcut will apply to methods in any class within this package.
   - The second asterisk (`*`) represents any class within the `com.ayah.aop.service` package.
   - The final `*` signifies any method name in those classes.
   - `(..)` indicates that the pointcut will match methods with any number of arguments, including no arguments.