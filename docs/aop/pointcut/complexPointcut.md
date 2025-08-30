---
sidebar_position: 6
---

# Complex Pointcut 

To create complex pointcuts, you can combine these designators using logical operators like `&&` (and), `||` (or), and `!` (not). Here are some examples:

#### Example 1: Combining `execution` and `within`

```java
@Pointcut(value = "execution(* com.ayah.aop.service.*.*(..)) && within(com.ayah.aop.service.MyService)")
public void executionInMyService() {
}
```
- **Explanation**: This pointcut matches any method execution within classes in the `com.ayah.aop.service` package, but only if the class is `MyService`.

#### Example 2: Combining `@annotation` and `args`

```java
@Pointcut(value = "@annotation(com.ayah.aop.annotation.Test) && args(param)")
public void testAnnotationWithParam(Object param) {
}
```
- **Explanation**: This pointcut matches methods annotated with `@Test` and where the method has a parameter (captured as `param`).

#### Example 3: Combining `within` and `target`

```java
@Pointcut(value = "within(com.ayah.aop.service.*) && target(com.ayah.aop.service.AspectService)")
public void withinServiceTarget() {
}
```
- **Explanation**: This pointcut matches join points within any class in the `com.ayah.aop.service` package, but only if the target object is of type `AspectService`.

#### Example 4: Using Logical Operators

```java
@Pointcut(value = "execution(* com.ayah.aop.service.*.*(..)) && !within(com.ayah.aop.service.ExcludeService)")
public void executionNotInExcludeService() {
}
```
- **Explanation**: This pointcut matches all method executions within `com.ayah.aop.service` package, except those within the `ExcludeService` class.

### Creating a Complex Pointcut

Here’s an example of a more complex pointcut that combines several conditions:

```java
@Pointcut(value = "(execution(* com.ayah.aop.service.*.*(..)) || execution(* com.ayah.aop.other.*.*(..))) && @annotation(com.ayah.aop.annotation.TrackTime) && args(param)")
public void complexPointcut(Object param) {
}
```
- **Explanation**: This pointcut matches methods that:
  - Are executed in classes within the `com.ayah.aop.service` or `com.ayah.aop.other` packages.
  - Are annotated with `@TrackTime`.
  - Have parameters (captured as `param`).
