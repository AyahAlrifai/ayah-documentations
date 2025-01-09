---
sidebar_position: 8
---

Spring Expression Language (SpEL) is a powerful feature in the Spring Framework that allows you to dynamically resolve values, perform operations, and invoke methods at runtime within Spring beans. SpEL can be used in conjunction with annotations like `@Value`, `@Bean`, `@Conditional`, and others to inject values, perform conditional logic, or manipulate data.

## SpEL Types

### 1. **Basic Syntax:**

SpEL expressions are enclosed in `#{}` when used within annotations like `@Value`. The general format for SpEL is:

```java
@Value("#{expression}")
```

Some examples of simple expressions:

- **Literal expressions:** `@Value("#{1 + 1}")` injects `2`.
- **Accessing properties:** `@Value("#{systemProperties['user.home']}")` injects the system property `user.home`.

### 2. **Literals:**

SpEL supports various literal types:

- **Numeric literals:** You can use integers, floating-point numbers, hexadecimals, and scientific notation.
  ```java
  @Value("#{10}") // Integer literal
  @Value("#{0x1A}") // Hexadecimal literal
  @Value("#{1.23E3}") // Scientific notation
  ```
- **String literals:** Strings are enclosed in single quotes.
  ```java
  @Value("#{ 'Hello World' }")
  private String message;
  ```
- **Boolean literals:**
  ```java
  @Value("#{true}") 
  private boolean flag;
  ```
- **Null literal:**
  ```java
  @Value("#{null}")
  private Object nullObject;
  ```

### 3. **Accessing Properties and Variables:**

SpEL allows you to access bean properties, system properties, environment variables, and more.

- **Bean Properties:**
  You can access a bean's properties using the `@` symbol.
  ```java
  @Value("#{myBean.propertyName}")
  private String propertyValue;
  ```
  Assuming `myBean` is a Spring bean defined elsewhere.

- **System Properties:**
  You can access system properties with `systemProperties`.
  ```java
  @Value("#{systemProperties['user.home']}")
  private String userHome;
  ```
  
- **Environment Variables:**
  You can access environment variables similarly using `systemEnvironment`.
  ```java
  @Value("#{systemEnvironment['JAVA_HOME']}")
  private String javaHome;
  ```

### 4. **Mathematical and Logical Operators:**

SpEL supports all standard mathematical and logical operators.

- **Arithmetic Operators:**
  ```java
  @Value("#{2 + 2}") // Addition, injects 4
  @Value("#{10 - 3}") // Subtraction, injects 7
  @Value("#{3 * 3}") // Multiplication, injects 9
  @Value("#{6 / 2}") // Division, injects 3
  @Value("#{10 % 3}") // Modulus, injects 1
  ```

- **Comparison Operators:**
  ```java
  @Value("#{1 == 1}") // Equality, injects true
  @Value("#{1 != 2}") // Inequality, injects true
  @Value("#{5 > 3}")  // Greater than, injects true
  @Value("#{3 < 5}")  // Less than, injects true
  ```

- **Logical Operators:**
  ```java
  @Value("#{true && false}") // AND, injects false
  @Value("#{true || false}") // OR, injects true
  @Value("#{!true}") // NOT, injects false
  ```

### 5. **Conditional Logic (Ternary Operator):**

SpEL supports conditional expressions using the ternary operator:

```java
@Value("#{isActive ? 'Active' : 'Inactive'}")
private String status;
```

If `isActive` is `true`, `status` will be `"Active"`; otherwise, it will be `"Inactive"`.

### 6. **Collections and Arrays:**

#### a. **Accessing Elements:**

You can access elements in arrays, lists, and maps using SpEL:

```java
@Value("#{myList[0]}") // Access the first element of the list
private String firstElement;

@Value("#{myMap['key']}") // Access the value for the key 'key'
private String mapValue;
```

#### b. **Creating Collections:**

You can create and inject collections directly with SpEL:

- **Lists:**
  ```java
  @Value("#{{'a', 'b', 'c'}}")
  private List<String> letters;
  ```

- **Maps:**
  ```java
  @Value("#{{'key1': 'value1', 'key2': 'value2'}}")
  private Map<String, String> map;
  ```

### 7. **Method Invocation:**

SpEL allows you to invoke methods on objects. This can be particularly useful for dynamic computations.

```java
@Value("#{myBean.calculateSomething()}")
private int result;
```

You can also invoke static methods:

```java
@Value("#{T(java.lang.Math).random()}")
private double randomValue;
```

Here, `T(java.lang.Math)` tells SpEL to use the `Math` class, and `random()` is the method being invoked.

### 8. **Object Construction:**

You can create new instances of classes within SpEL expressions:

```java
@Value("#{new java.util.Date()}")
private Date currentDate;
```

This creates a new `Date` object and injects the current date and time.

### 9. **Regular Expressions:**

SpEL supports regular expressions for matching strings:

```java
@Value("#{'Hello World' matches '^Hello.*'}")
private boolean matchesHello;
```

This will inject `true` if the string "Hello World" matches the regular expression.

### 10. **Safe Navigation Operator:**

The safe navigation operator `?.` can be used to avoid `NullPointerExceptions` when accessing properties or methods. If the object is `null`, the expression will evaluate to `null` rather than throwing an exception.

```java
@Value("#{myBean?.propertyName}")
private String safeProperty;
```

If `myBean` is `null`, `safeProperty` will also be `null` instead of causing an exception.

### 11. **Elvis Operator:**

The Elvis operator `?:` provides a shorthand way to handle `null` values, similar to a default fallback.

```java
@Value("#{myBean.propertyName ?: 'Default Value'}")
private String propertyValue;
```

If `myBean.propertyName` is `null`, `propertyValue` will be `"Default Value"`.

### 12. **Projection and Selection:**

SpEL provides powerful collection processing capabilities, including projection and selection.

#### a. **Projection:**

Projection allows you to apply an expression to each element of a collection and return a new collection with the results.

```java
@Value("#{myList.?[startsWith('A')]}")
private List<String> namesStartingWithA;
```

This filters the `myList` collection to only include elements that start with the letter "A".

#### b. **Selection:**

Selection filters a collection based on a condition.

```java
@Value("#{myList.?[length() > 3]}")
private List<String> longNames;
```

This filters `myList` to include only elements with a length greater than 3.

### 13. **Bean References and Dependency Injection:**

You can reference other beans within SpEL expressions using the `@` symbol.

```java
@Value("#{myBean.someMethod()}")
private String result;
```

You can also reference beans by name:

```java
@Value("@myBean.someProperty")
private String beanProperty;
```

### 14. **Complex Expressions:**

You can combine all these features to create complex expressions. For example:

```java
@Value("#{systemProperties['os.name'] == 'Windows 10' ? 'Windows detected' : 'Non-Windows detected'}")
private String osDetection;
```

This expression checks the operating system and assigns a message based on the result.

### 15. **Customizing with Custom Beans:**

If you need more advanced logic, you can create a custom bean and use SpEL to invoke it. For example:

```java
@Component
public class CustomSpelFunction {
    public String processString(String input) {
        return input.toUpperCase();
    }
}
```

Now, you can use this bean in your SpEL expression:

```java
@Value("#{customSpelFunction.processString('hello world')}")
private String processedString;
```

This will inject `"HELLO WORLD"`.

### 16. **Using SpEL in Annotations Other than `@Value`:**

While `@Value` is the most common use case, SpEL can be used in other annotations like `@Conditional` or `@Profile`.

#### a. **Conditional Logic:**

```java
@Bean
@ConditionalOnExpression("#{systemProperties['os.name'].contains('Windows')}")
public MyService windowsService() {
    return new WindowsService();
}
```

This bean will only be created if the operating system is Windows.

#### b. **Profile-Based Bean Activation:**

```java
@Bean
@Profile("#{systemEnvironment['ENV'] == 'production'}")
public MyService productionService() {
    return new ProductionService();
}
```

This bean will only be active if the `ENV` environment variable is set to `production`.

## Reference

ChatGPT