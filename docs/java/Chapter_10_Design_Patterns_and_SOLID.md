---
sidebar_label: "Design Patterns & SOLID"
sidebar_position: 10
---

# Chapter 10: Design Patterns & SOLID Foundations

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain what a design pattern is, and why reusing proven solutions is more valuable than inventing new ones from scratch.
- Explain and implement the Singleton pattern, and describe why it matters for understanding Spring Beans later.
- Explain and implement the Factory pattern, and describe when it is preferable to directly using `new`.
- Explain and implement the Builder pattern for objects with many optional attributes.
- Explain the DAO pattern and why separating data access from business logic matters.
- Explain each of the five SOLID principles in plain language, with a concrete Java example for each.
- Recognize how these patterns and principles directly prepare you for Spring Boot's core architecture in Phase 3.

---

## 📌 Introduction — Why Learn Design Patterns Before Spring Boot?

You are about to leave the world of "Core Java" and enter Phase 3 of this book: Spring Boot. This is a deliberate, important transition point, and this chapter exists specifically to bridge it.

Spring Boot is not a random collection of features. It is built, from its very foundation, on top of a small set of well-established software design ideas: the Singleton pattern, the Factory pattern, and the SOLID principles — especially the "D" in SOLID, Dependency Inversion, which is the direct conceptual ancestor of Spring's most famous feature, Dependency Injection. If you learn Spring Boot without first understanding these ideas, you will be memorizing framework "magic" without understanding *why* it works the way it does. If you learn these ideas first, Spring Boot's design choices will feel obvious and inevitable, rather than arbitrary.

A **design pattern** is not a specific piece of code you copy and paste. It is a **named, reusable solution to a problem that shows up repeatedly across many different projects**. Naming these patterns gives developers a shared vocabulary — when one experienced developer tells another "just use a Factory here," an enormous amount of design detail is communicated instantly, without either person needing to explain the underlying mechanics from scratch.

---

## 🧠 Theory — The Singleton Pattern

The **Singleton pattern** restricts a class so that only **one single instance** of it can ever exist throughout the entire lifetime of the application, and provides one well-known, global way to access that single instance.

```java
public class ConfigurationManager {
    private static ConfigurationManager instance;
    private String appName;

    private ConfigurationManager() {   // Notice: PRIVATE constructor
        this.appName = "MyApplication";
    }

    public static ConfigurationManager getInstance() {
        if (instance == null) {
            instance = new ConfigurationManager();
        }
        return instance;
    }

    public String getAppName() {
        return appName;
    }
}
```

Let's carefully explain the mechanics here.

- `private ConfigurationManager()` — The constructor is marked `private`, which means **no code outside this class** can create a new `ConfigurationManager` using `new ConfigurationManager()`. This is the entire trick behind Singleton: by hiding the constructor, the class itself becomes the *only* thing capable of creating an instance of itself.
- `private static ConfigurationManager instance;` — A `static` field, meaning it belongs to the *class itself*, not to any individual object — there is exactly one copy of this field, shared across the entire application, regardless of how many times `getInstance()` is called.
- `public static ConfigurationManager getInstance() { ... }` — This is the single, controlled gateway for obtaining the one shared instance. The very first time it's called, `instance` is still `null`, so it creates the object exactly once, and stores it. Every subsequent call finds `instance` already populated, and simply returns that same, existing object, without ever creating a second one.

```java
ConfigurationManager config1 = ConfigurationManager.getInstance();
ConfigurationManager config2 = ConfigurationManager.getInstance();
System.out.println(config1 == config2);   // true — they are literally the exact same object!
```

> **Real-World Analogy**
> Think of a government's single, official currency mint. There isn't a separate mint for every citizen who wants to print money — there is exactly one, centrally controlled facility, and everyone who needs currency goes through that same single source, rather than each person creating their own independent version.

> 🧠 **Behind the Scenes**
> This pattern is directly relevant to Spring Boot, because Spring Beans (objects managed by Spring's container, which you'll meet in Phase 3) default to **Singleton scope**. When your application asks Spring for a particular service object, Spring does not create a fresh, brand-new instance every single time — by default, it creates that object exactly once, and hands out that same shared instance to every part of your application that requests it, exactly like the `ConfigurationManager` example above, except Spring manages this process automatically for you, without you writing a private constructor or a `getInstance()` method yourself.

---

## 🧠 Theory — The Factory Pattern

The **Factory pattern** delegates the responsibility of *creating* objects to a dedicated, separate piece of code, rather than scattering `new SomeClass()` calls directly throughout your entire codebase.

```java
interface Notification {
    void send(String message);
}

class EmailNotification implements Notification {
    public void send(String message) { System.out.println("Email: " + message); }
}

class SMSNotification implements Notification {
    public void send(String message) { System.out.println("SMS: " + message); }
}

class NotificationFactory {
    public static Notification create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailNotification();
            case "SMS" -> new SMSNotification();
            default -> throw new IllegalArgumentException("Unknown notification type: " + type);
        };
    }
}
```

```java
Notification notification = NotificationFactory.create("EMAIL");
notification.send("Your order has shipped!");
```

Why is this better than simply writing `new EmailNotification()` directly wherever it's needed? Because now, the *decision* about exactly which concrete class to instantiate lives in exactly **one place** — the factory. If your application later needs to add a `PushNotification` type, you modify the factory once, and every single piece of calling code throughout your application, which only ever interacts with the general `Notification` interface, continues working correctly without any changes at all.

> ✅ **Best Practice**
> Reach for a Factory whenever object creation involves meaningful decision logic (choosing between several possible concrete implementations), or whenever you want calling code to depend only on an interface, never on a specific concrete class. This directly supports the "D" in SOLID (Dependency Inversion), which we'll cover shortly.

---

## 🧠 Theory — The Builder Pattern

The **Builder pattern** simplifies constructing objects that have many attributes, especially when many of those attributes are optional. Without it, you often end up with constructors that take a long, confusing list of parameters, many of which might be irrelevant for a given use case.

```java
// The problem this solves: which parameter is which, at a glance?
Pizza pizza = new Pizza("Large", true, false, true, false, "Thin Crust");
```

```java
public class Pizza {
    private final String size;
    private final boolean extraCheese;
    private final boolean pepperoni;
    private final String crustType;

    private Pizza(Builder builder) {
        this.size = builder.size;
        this.extraCheese = builder.extraCheese;
        this.pepperoni = builder.pepperoni;
        this.crustType = builder.crustType;
    }

    public static class Builder {
        private String size = "Medium";        // Sensible defaults
        private boolean extraCheese = false;
        private boolean pepperoni = false;
        private String crustType = "Regular";

        public Builder size(String size) { this.size = size; return this; }
        public Builder extraCheese(boolean value) { this.extraCheese = value; return this; }
        public Builder pepperoni(boolean value) { this.pepperoni = value; return this; }
        public Builder crustType(String type) { this.crustType = type; return this; }

        public Pizza build() {
            return new Pizza(this);
        }
    }
}
```

```java
Pizza myPizza = new Pizza.Builder()
    .size("Large")
    .extraCheese(true)
    .crustType("Thin Crust")
    .build();
```

This is dramatically more readable: every attribute is explicitly labeled by name, unnecessary attributes simply keep their sensible defaults, and the order you set attributes in doesn't matter at all. Notice that each `Builder` method — `size(...)`, `extraCheese(...)`, and so on — returns `this` (the `Builder` object itself), which is what allows these calls to be **chained** together fluently, one after another, in a single readable expression.

---

## 🧠 Theory — The DAO Pattern

**DAO** stands for **Data Access Object**. The DAO pattern isolates all database-related operations — queries, inserts, updates, deletes — into a dedicated layer, completely separate from your application's core business logic.

```java
public interface CustomerDAO {
    Customer findById(long id);
    void save(Customer customer);
    void delete(long id);
}
```

Business logic elsewhere in the application interacts only with this `CustomerDAO` interface, never with raw database queries directly. This means the *how* of data storage (which specific database, which specific query syntax) can change entirely — switching from one database technology to another, for example — without requiring any changes to the business logic that depends on it, as long as the new implementation still fulfills the same `CustomerDAO` contract.

> 🧠 **Behind the Scenes**
> This pattern is the direct conceptual ancestor of Spring Data JPA's `Repository` interfaces, which you will meet in Chapter 13. Spring takes this exact idea — a dedicated interface describing data operations, separated from business logic — and goes one step further, automatically *generating* the actual implementation for you behind the scenes, based purely on the method names and signatures you declare.

---

## 🧠 Theory — SOLID: Five Principles for Maintainable Software

**SOLID** is an acronym for five foundational object-oriented design principles. They are not rigid, mechanical rules to apply blindly everywhere — they are guidelines that, together, tend to produce software that is easier to understand, extend, and maintain over time, especially as a codebase grows and more developers work on it.

### S — Single Responsibility Principle

**Every class should have one, and only one, clearly focused reason to change.**

```java
// VIOLATION: this one class has THREE separate responsibilities
class Employee {
    void calculatePay() { /* payroll logic */ }
    void saveToDatabase() { /* database logic */ }
    void generateReport() { /* reporting logic */ }
}

// BETTER: each responsibility lives in its own dedicated class
class Employee { /* just employee data */ }
class PayrollCalculator { void calculatePay(Employee e) { /* ... */ } }
class EmployeeRepository { void save(Employee e) { /* ... */ } }
class EmployeeReportGenerator { void generateReport(Employee e) { /* ... */ } }
```

If payroll rules change, only `PayrollCalculator` needs to change. If the database technology changes, only `EmployeeRepository` needs to change. Each class has exactly one reason to ever be modified.

### O — Open/Closed Principle

**Code should be open for extension, but closed for modification.** In other words, you should be able to add new behavior to a system without having to rewrite and risk breaking existing, already-working code.

```java
// VIOLATION: adding a new shape means editing this method every single time
double calculateArea(Object shape) {
    if (shape instanceof Circle c) return Math.PI * c.radius() * c.radius();
    if (shape instanceof Square s) return s.side() * s.side();
    // Adding a Triangle means coming back here and modifying this method again
    return 0;
}

// BETTER: new shapes EXTEND the system without modifying existing code at all
interface Shape { double calculateArea(); }
class Circle implements Shape { public double calculateArea() { /* ... */ return 0; } }
class Square implements Shape { public double calculateArea() { /* ... */ return 0; } }
// A new Triangle class can be added later WITHOUT touching Circle, Square, or any calling code
```

### L — Liskov Substitution Principle

**A subclass must be fully substitutable for its parent class, without breaking the correctness of the program.** Any code written to work with a parent type should continue to work correctly, without any special-case handling, when given any of its subclasses instead.

```java
class Bird {
    void fly() { System.out.println("Flying"); }
}

class Penguin extends Bird {
    @Override
    void fly() {
        throw new UnsupportedOperationException("Penguins can't fly!");   // VIOLATION!
    }
}
```

This violates the principle: any code that correctly worked with a `Bird` reference now breaks unexpectedly the moment it happens to receive a `Penguin`. The real design flaw here isn't `Penguin` itself — it's that `fly()` was placed too high in the hierarchy, on `Bird`, when not every bird can actually fly. A better design would separate `FlyingBird` from `Bird` entirely, so `Penguin` is never forced to inherit a behavior it cannot honestly support.

### I — Interface Segregation Principle

**Favor several small, focused interfaces over one large, bloated interface that forces implementing classes to support methods they don't actually need.**

```java
// VIOLATION: a single, bloated interface
interface Worker {
    void work();
    void eat();
    void sleep();
}
// A Robot implementing Worker is forced to implement eat() and sleep(), which make no sense for it

// BETTER: small, focused interfaces
interface Workable { void work(); }
interface Eatable { void eat(); }
interface Sleepable { void sleep(); }

class Robot implements Workable {   // Only implements what genuinely applies to it
    public void work() { System.out.println("Working"); }
}
```

### D — Dependency Inversion Principle

**Depend on abstractions (interfaces), not on concrete implementation classes.** This is the single most important principle for understanding Spring Boot, and we introduced it briefly back in Chapter 3 — this chapter is where it fully pays off.

```java
// VIOLATION: UserService is tightly coupled to one SPECIFIC database implementation
class UserService {
    private MySQLUserRepository repository = new MySQLUserRepository();   // Directly tied to MySQL!
}

// BETTER: UserService depends on an ABSTRACTION, not a specific implementation
interface UserRepository {
    User findById(long id);
}

class UserService {
    private final UserRepository repository;   // Depends on the INTERFACE, not a specific database

    public UserService(UserRepository repository) {   // The specific implementation is provided from OUTSIDE
        this.repository = repository;
    }
}
```

`UserService` no longer knows or cares whether it's ultimately talking to MySQL, PostgreSQL, or an in-memory test database — it only knows about the `UserRepository` *contract*. The actual, concrete implementation is decided and supplied from *outside* the class, at the moment `UserService` is created.

> 🧠 **Behind the Scenes**
> This is exactly the principle behind Spring's Dependency Injection, which you will study in full detail in Chapter 11. Spring's IoC (Inversion of Control) container is, at its core, a sophisticated, automated system for supplying these "outside" concrete implementations to classes like `UserService`, based purely on interfaces — precisely fulfilling the Dependency Inversion Principle, but doing the wiring automatically rather than requiring you to manually pass the correct implementation in yourself every time.

---

## ⚠ Common Mistakes

1. **Treating design patterns as mandatory templates to force into every project**, rather than tools to reach for only when they genuinely solve a real problem you actually have.
2. **Building a Singleton with a `public` constructor**, accidentally allowing multiple instances to be created anyway, completely defeating the pattern's entire purpose.
3. **Violating Single Responsibility by letting classes grow into "do everything" god-objects**, especially as a codebase grows and it feels easier to just add "one more method" to an existing class rather than creating a new, focused one.
4. **Depending directly on concrete classes instead of interfaces**, making code rigid and difficult to test or later swap out, directly violating Dependency Inversion.
5. **Confusing the Builder pattern with simply having a constructor with many parameters and no fluent chaining** — the real value of Builder comes from its named, chainable methods and sensible defaults, not merely from splitting construction into multiple steps.

---

## ✅ Best Practices

- Introduce a design pattern only once you clearly recognize the specific problem it solves in your own code — not preemptively, "just in case."
- Favor small, focused interfaces (Interface Segregation) and depend on abstractions rather than concrete classes (Dependency Inversion) as a general, everyday habit, even outside of any officially named pattern.
- When designing a class hierarchy, always ask: "could a subclass ever need to violate a promise its parent makes?" If so, reconsider the hierarchy (Liskov Substitution).
- Keep classes narrowly focused on a single responsibility; if you find yourself describing a class using the word "and," it may be time to split it.

---

## 🎯 Exercises

**Easy**

1. In your own words, explain what a design pattern is, and why naming a pattern is useful for communication between developers.
2. What makes a Singleton's constructor different from an ordinary class's constructor?
3. In one sentence, explain the core purpose of the Factory pattern.
4. What SOLID principle does "a class should have only one reason to change" describe?
5. True or false, with justification: "Dependency Inversion means high-level code should depend directly on low-level, concrete implementation classes."

**Medium**

6. Implement a thread-unsafe Singleton `Logger` class from scratch, and explain, in a comment, exactly what makes it a Singleton.
7. Design a `ShapeFactory` that creates `Circle`, `Square`, or `Triangle` objects based on a `String` input, all implementing a shared `Shape` interface.
8. Rewrite a class that violates the Interface Segregation Principle (similar to the `Worker` example) into several smaller, focused interfaces.
9. Explain, using the `UserService`/`UserRepository` example, exactly how Dependency Inversion makes a class easier to test.
10. Design a `Builder` for a `Car` class with attributes like `color`, `hasSunroof`, and `engineType`, providing sensible defaults for each.

**Hard**

11. Design a small DAO-based system with a `ProductDAO` interface and two different implementations — one backed by an in-memory `List`, and one that would represent a real database (stub the actual database calls) — and demonstrate that business logic using `ProductDAO` works identically with either implementation.
12. Take the `Bird`/`Penguin` Liskov Substitution violation example from this chapter and redesign the class hierarchy correctly, explaining your reasoning for each change.
13. Explain, in a short paragraph, how the Singleton pattern, the Factory pattern, and Dependency Inversion, taken together, foreshadow exactly what Spring Boot's IoC container will automate for you starting in the next chapter.

---

## 🧩 Quiz

**Multiple Choice**

1. What is a design pattern?
   a) A specific block of code to copy-paste   b) A named, reusable solution to a recurring design problem   c) A Java keyword   d) A type of exception

2. What keyword typically hides a Singleton's constructor from outside code?
   a) `public`   b) `protected`   c) `private`   d) `static` alone, with no visibility change

3. What does the Factory pattern primarily delegate?
   a) Sorting logic   b) Object creation logic   c) Exception handling   d) Thread management

4. What problem does the Builder pattern primarily solve?
   a) Managing many threads at once   b) Constructing objects with many, often optional, attributes readably   c) Sorting collections   d) Handling database transactions

5. What does DAO stand for?
   a) Data Access Object   b) Direct Application Output   c) Dynamic Abstract Object   d) Database Administration Order

6. Which SOLID letter stands for "a class should have only one reason to change"?
   a) O   b) L   c) S   d) I

7. Which SOLID principle is violated when a subclass throws an exception for a method its parent guarantees will work?
   a) Single Responsibility   b) Open/Closed   c) Liskov Substitution   d) Interface Segregation

8. Which SOLID principle favors several small, focused interfaces over one large one?
   a) Dependency Inversion   b) Interface Segregation   c) Open/Closed   d) Single Responsibility

9. What does Dependency Inversion recommend depending on?
   a) Concrete implementation classes   b) Abstractions (interfaces)   c) Static methods only   d) Global variables

10. Which pattern is directly related to Spring's default Bean scope?
    a) Builder   b) DAO   c) Singleton   d) Factory

**True / False**

11. A Singleton allows any code to freely create as many instances as it wants.
12. The Open/Closed Principle recommends modifying existing, working code every time new behavior is needed.
13. The DAO pattern separates data access logic from business logic.
14. Dependency Inversion is the direct conceptual foundation for Spring's Dependency Injection.
15. Design patterns should be applied to every class in a project, regardless of whether a real problem exists.

**Debugging Questions**

16. This "Singleton" allows multiple instances to be created. Identify and fix the flaw:
```java
public class Settings {
    public Settings() { }
    private static Settings instance = new Settings();
    public static Settings getInstance() { return instance; }
}
```
17. This class violates Single Responsibility. Identify the separate responsibilities and describe how you would split it:
```java
class Order {
    void calculateTotal() { /* ... */ }
    void sendConfirmationEmail() { /* ... */ }
    void saveToDatabase() { /* ... */ }
}
```
18. This code violates Dependency Inversion. Explain why, and rewrite it correctly:
```java
class ReportService {
    private PdfExporter exporter = new PdfExporter();   // Concrete class, hardcoded
}
```

---

## 📝 Summary

In this chapter, you learned four foundational design patterns — Singleton, Factory, Builder, and DAO — each solving a specific, recurring problem: controlling instance creation, centralizing object-creation decisions, readably constructing complex objects, and separating data access from business logic. You then studied the five SOLID principles in depth, with concrete Java examples for each: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. Most importantly, you saw how these ideas are not academic trivia — they are the direct conceptual foundation for Spring Boot's core architecture, which you are about to study in Phase 3. Spring Beans default to Singleton scope. Spring's container acts as an enormous, automated Factory. And Spring's entire Dependency Injection system is Dependency Inversion, automated at scale. You are now fully prepared to understand not just *how* Spring Boot works, but *why* it was designed the way it was.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
Treat this chapter explicitly as a bridge, and say so directly to students. Frame every single pattern and principle with an explicit forward reference: "you will see this exact idea again, automated, in the very next chapter." This framing transforms what could otherwise feel like abstract theory into concrete, motivated preparation, and dramatically increases how much students retain once they reach Spring Boot.

**Common student misconceptions:**
- Students often believe design patterns are rigid templates that must be applied exactly as shown, rather than flexible solutions adapted to a specific problem's actual shape. Emphasize repeatedly that the *pattern* is a concept, and the code shown is just one possible implementation of that concept.
- Many students initially see SOLID as five disconnected rules to memorize independently. Draw explicit connections between them — for example, show how following Dependency Inversion naturally supports Open/Closed, since depending on interfaces rather than concrete classes is exactly what allows new implementations to be added without modifying existing code.
- Students frequently underestimate how directly this chapter maps onto Spring Boot, since Spring's "magic" often obscures the underlying mechanism. Consider a brief live preview: show a real `@Service` and `@Autowired` example from Spring without explaining the annotations in depth yet, and simply point out, "this is Dependency Inversion, automated."

**Recommended classroom demonstration:**
Live-refactor the `UserService`/`MySQLUserRepository` Dependency Inversion violation into its corrected, interface-based form, step by step, in front of the class. Then explicitly ask students: "if we wanted to now write an automated test for `UserService` without touching a real database, how would this refactored version make that possible?" This bridges directly into testing concepts covered later in Phase 3.
