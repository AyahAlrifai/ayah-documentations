---
sidebar_label: "Spring Core & Dependency Injection"
sidebar_position: 11
---

# Chapter 11: Spring Core & Dependency Injection

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain the difference between the traditional Spring Framework and Spring Boot, and why Spring Boot was created.
- Explain Inversion of Control (IoC) in plain language, and describe what problem it solves.
- Explain Dependency Injection (DI), and identify the three ways Spring can inject dependencies.
- Explain what the Spring IoC Container is, and how it discovers and manages your application's objects.
- Explain Component Scanning and Auto-Configuration, and how Spring decides what to configure automatically.
- Explain the Spring Bean lifecycle, from creation to destruction.
- Explain why Constructor Injection is the recommended, professional approach over Field Injection.

---

## 📌 Introduction — Entering Phase 3

Everything you have learned so far in this book — classes, objects, interfaces, collections, exceptions, and especially the SOLID principles from Chapter 10 — was building toward this exact moment. Spring Boot is, without exaggeration, the most widely used framework for building backend applications in the entire Java ecosystem, powering everything from small internal company tools to massive systems serving millions of users. And crucially, Spring Boot is not some entirely new way of thinking about software — it is an extremely refined, practical application of ideas you already understand: Dependency Inversion, the Factory pattern, and Singleton-scoped objects, all automated for you at an enormous scale.

This chapter is your entry point into that world. We are going to slow down and explain absolutely everything, assuming no prior web development or framework experience whatsoever, exactly as promised at the start of this book.

---

## 🧠 Theory — Spring Framework vs. Spring Boot

The **Spring Framework** has existed since the early 2000s, and it introduced enormously powerful capabilities for building enterprise Java applications: dependency injection, transaction management, security, and much more. But using it required a substantial amount of manual configuration — developers had to write extensive XML configuration files, or detailed Java configuration classes, explicitly telling Spring about every single object it needed to manage and how those objects related to each other.

**Spring Boot**, released in 2014, is built directly *on top of* the original Spring Framework — it does not replace it. Spring Boot's core contribution is **convention over configuration**: instead of requiring you to manually specify every detail, Spring Boot examines what libraries are present in your project and automatically applies sensible, production-ready default configurations, dramatically reducing the amount of setup code needed to get a real, working application running.

> **Real-World Analogy**
> Think of the traditional Spring Framework like buying a car as a kit of individual parts, with a very detailed instruction manual, and assembling it entirely yourself — engine, wheels, wiring, all separately specified and connected by hand. Spring Boot is like buying that same car already assembled at the factory, with sensible, well-tested default settings already applied — the radio already works, the air conditioning is already wired correctly — while still allowing you to open the hood and customize absolutely anything you want, if you ever need to.

> 💡 **Tip**
> When you hear a developer say "I'm building a Spring app," they very likely mean Spring Boot specifically, since it has become the overwhelmingly standard way of using the Spring ecosystem for new projects today. The underlying Spring Framework concepts, however — especially IoC and DI, which we cover next — are exactly the same either way.

---

## 🧠 Theory — Inversion of Control (IoC)

**Inversion of Control** is a design principle where the responsibility for creating and managing objects is taken *away* from your own code, and handed over to a separate, external system — in Spring's case, the **Spring IoC Container**.

Recall from ordinary Java, without any framework, how a class typically obtains the other objects it depends on:

```java
// Traditional Java — the class creates its OWN dependency directly
public class UserService {
    private UserRepository repository = new UserRepository();   // UserService is IN CONTROL here
}
```

In this traditional style, `UserService` is entirely "in control" — it decides exactly when and how its `UserRepository` gets created. Under Spring's IoC model, this control is **inverted** — flipped around. `UserService` no longer creates its own dependency. Instead, it simply *declares* that it needs a `UserRepository`, and an external system (the Spring Container) takes full responsibility for creating that `UserRepository` and *handing it to* `UserService`.

```java
@Service
public class UserService {
    private final UserRepository repository;

    @Autowired
    public UserService(UserRepository repository) {   // Spring provides this from OUTSIDE
        this.repository = repository;
    }
}
```

> **Real-World Analogy: The Hollywood Actor**
> Think of a Hollywood actor filming a scene. The actor does not build the stage, wire the studio lighting, hire the camera crew, or direct the other actors appearing alongside them. The production company (the Spring IoC Container) handles the entire surrounding environment, and delivers the actor exactly what they need — their costars, their props, their scripted lines — precisely when they walk onto the set. The actor simply focuses on acting; the production company handles everything else "around" them. `UserService` simply focuses on its business logic; Spring handles creating and providing everything it needs "around" it.

This is exactly the Dependency Inversion Principle from Chapter 10, in action — except now, instead of *you* manually writing code that passes the correct implementation into `UserService`'s constructor, Spring does that wiring for you, automatically, at application startup.

---

## 🧠 Theory — Dependency Injection (DI): The Mechanism Behind IoC

If Inversion of Control is the *principle*, **Dependency Injection** is the specific *mechanism* Spring uses to achieve it — literally, the act of "injecting" (providing) an object's required dependencies into it from the outside, rather than letting it construct them internally.

Spring supports three different styles of injection.

### Constructor Injection (Recommended)

```java
@Service
public class UserService {
    private final UserRepository repository;

    @Autowired
    public UserService(UserRepository repository) {
        this.repository = repository;
    }
}
```

The dependency is provided as a parameter to the constructor. Since `repository` is declared `final`, and it is only ever assigned inside the constructor, Java itself guarantees that `UserService` can never exist in a broken, half-initialized state where `repository` is missing.

### Setter Injection

```java
@Service
public class UserService {
    private UserRepository repository;

    @Autowired
    public void setRepository(UserRepository repository) {
        this.repository = repository;
    }
}
```

The dependency is provided through a standard setter method, after the object has already been constructed. This allows the dependency to be optional, or changed later, but it also means there is a window of time where `UserService` exists with `repository` still unset.

### Field Injection (Discouraged)

```java
@Service
public class UserService {
    @Autowired
    private UserRepository repository;   // Injected directly into the field itself
}
```

This is the shortest to write, and you will see it frequently in older tutorials and legacy codebases, but it is now widely discouraged in professional Spring development.

> ⚠ **Warning — Always Prefer Constructor Injection**
> Field injection has two real, practical downsides that matter in professional codebases. First, it makes **unit testing significantly harder** — as you'll see in Chapter 14, testing frameworks like Mockito can supply mock dependencies far more cleanly through a constructor parameter than by reaching into a private field. Second, it hides a class's true dependencies — with constructor injection, simply looking at a class's constructor signature immediately tells you everything it needs to function; with field injection, you must scan through the entire class body to discover the same information. **Always prefer Constructor Injection.** It makes dependencies explicit, it guarantees an object can never exist without everything it needs (thanks to `final` fields), and it makes testing dramatically simpler.

---

## 🧠 Theory — The Spring IoC Container and Beans

The **Spring IoC Container** is the actual runtime engine responsible for creating, configuring, wiring together, and managing the complete lifecycle of your application's objects. Any object that the Spring Container creates and manages on your behalf is called a **Bean**.

How does Spring know *which* of your classes should become Beans? Primarily through **stereotype annotations** placed directly on your class declarations:

| Annotation | Typical Purpose |
|---|---|
| `@Component` | A generic, general-purpose Spring-managed Bean |
| `@Service` | A Bean specifically representing business logic (the Service layer, covered in the next chapter) |
| `@Repository` | A Bean specifically representing data access logic |
| `@Controller` / `@RestController` | A Bean specifically handling incoming web requests |

`@Service`, `@Repository`, and `@Controller` are all, underneath, specialized versions of the general-purpose `@Component` annotation — they carry the exact same core meaning ("please manage this as a Bean"), but their more specific names communicate the *role* that class plays within your application's layered architecture, which we'll fully explore in the next chapter.

### Component Scanning

When your Spring Boot application starts up, it performs **Component Scanning** — automatically searching through your project's packages, looking for any class annotated with `@Component` (or one of its specialized variants), and registering each one it finds as a managed Bean, without you needing to manually list every single class anywhere.

```
Application starts
       │
       ▼
Spring scans your project's packages
       │
       ▼
Finds @Service, @Repository, @RestController classes...
       │
       ▼
Creates a Bean for each one, and wires their declared
constructor dependencies together automatically
       │
       ▼
Application is fully ready to handle requests
```

### Auto-Configuration

Beyond scanning your own code, Spring Boot also performs **Auto-Configuration** — inspecting exactly which libraries are present on your project's classpath (the dependencies you declared in `pom.xml`, back in Chapter 9), and automatically configuring sensible, appropriate default Beans for them. If Spring Boot detects a database driver library on your classpath, for example, it can automatically configure a database connection Bean for you, using reasonable defaults, without you writing that configuration by hand.

> 🧠 **Behind the Scenes**
> This is precisely what "convention over configuration" means in practice. Auto-Configuration is essentially an enormous, pre-built collection of conditional configuration logic, shipped inside Spring Boot itself, that constantly asks: "is this specific library present? If so, here is a sensible default Bean setup for it." You remain completely free to override any of these defaults explicitly in your own configuration whenever your application's specific needs differ from Spring's sensible-but-generic defaults.

---

## 🧠 Theory — The Bean Lifecycle

Every Bean managed by the Spring Container goes through a predictable, well-defined lifecycle, from the moment the application starts to the moment it shuts down.

```
 1. Container starts up
        │
        ▼
 2. Bean is INSTANTIATED (its constructor runs, dependencies are injected)
        │
        ▼
 3. Any @PostConstruct-annotated method runs
    (a hook for custom setup logic, after all dependencies are ready)
        │
        ▼
 4. Bean is fully ready and available for use throughout the application
        │
        │   ... application runs normally for as long as needed ...
        │
        ▼
 5. Application begins shutting down
        │
        ▼
 6. Any @PreDestroy-annotated method runs
    (a hook for custom cleanup logic, like closing connections)
        │
        ▼
 7. Bean is destroyed
```

By default, as you learned in Chapter 10, a Bean has **Singleton scope** — Spring creates exactly one shared instance of it, once, and hands out that same instance to every part of your application that requests it, for the entire lifetime of the running application.

---

## ⚠ Common Mistakes

1. **Using Field Injection out of habit**, since it appears frequently in older tutorials, without realizing it makes testing harder and hides a class's true dependencies.
2. **Manually creating objects with `new` for classes that should be Spring-managed Beans**, accidentally bypassing the entire IoC container and losing automatic dependency injection for that object.
3. **Forgetting to place a class in a package Spring actually scans.** Component Scanning, by default, only looks within the package containing your main application class and its sub-packages — classes placed entirely outside that structure may be silently skipped.
4. **Assuming every object in a Spring application is automatically a Bean.** Only classes explicitly annotated with `@Component` (or a specialized variant), or explicitly declared through other configuration mechanisms, become Spring-managed Beans.
5. **Confusing Auto-Configuration with magic that cannot be overridden.** Every auto-configured default can be explicitly customized or replaced when your application's needs genuinely differ from the sensible default Spring Boot chose.

---

## ✅ Best Practices

- Always use Constructor Injection for required dependencies, declaring the corresponding fields as `final`.
- Use the most specific stereotype annotation available (`@Service`, `@Repository`, `@RestController`) rather than the generic `@Component`, since it communicates intent more clearly to anyone reading your code.
- Let Auto-Configuration handle sensible defaults, and only introduce explicit, custom configuration when your application's actual requirements genuinely diverge from those defaults.
- Keep your main application class at the root of your project's package structure, so Component Scanning naturally covers your entire codebase without extra configuration.

---

## 🎯 Exercises

**Easy**

1. In one or two sentences, explain the relationship between Spring Boot and the original Spring Framework.
2. What does IoC stand for, and what is the core idea behind it?
3. Name Spring's three injection styles, and identify which one is recommended.
4. What annotation is commonly used to mark a class as a business-logic Bean?
5. True or false, with justification: "Every class in a Spring Boot project automatically becomes a Bean."

**Medium**

6. Rewrite a class using Field Injection into a version using proper Constructor Injection.
7. Explain, using the Hollywood actor analogy, how Inversion of Control changes where the responsibility for creating dependencies lives.
8. Explain the difference between `@Component` and its more specialized variants (`@Service`, `@Repository`, `@Controller`).
9. Explain what Component Scanning does, and describe what could go wrong if a class were placed outside the scanned package structure.
10. Describe, in order, the main stages of a Spring Bean's lifecycle, from creation to destruction.

**Hard**

11. Design a small three-class Spring application (`@RestController`, `@Service`, `@Repository`), using Constructor Injection throughout, and explain, for each class, exactly which dependency Spring provides to it and where that dependency comes from.
12. Explain, in a detailed paragraph, why Constructor Injection's use of `final` fields provides a genuine guarantee that Field Injection cannot offer, and connect this to a specific real-world bug that guarantee prevents.
13. Explain, in your own words, how Auto-Configuration embodies "convention over configuration," and describe a realistic scenario where a developer would need to override an auto-configured default.

---

## 🧩 Quiz

**Multiple Choice**

1. What is Spring Boot built on top of?
   a) A completely separate framework   b) The original Spring Framework   c) Java EE only   d) Maven

2. What does IoC stand for?
   a) Internal Object Creation   b) Inversion of Control   c) Independent Object Configuration   d) Integrated Object Container

3. Which injection style is recommended for professional Spring development?
   a) Field Injection   b) Setter Injection   c) Constructor Injection   d) None; injection should always be manual

4. What is a Spring Bean?
   a) Any Java object   b) An object created and managed by the Spring IoC Container   c) A type of exception   d) A database table

5. What does Component Scanning do?
   a) Scans for security vulnerabilities   b) Automatically finds and registers annotated classes as Beans   c) Compiles Java source code   d) Formats code style

6. What does Auto-Configuration rely on to decide what to configure?
   a) The current date   b) Which libraries are present on the classpath   c) Random selection   d) Manual XML files only

7. What is the default scope of a Spring Bean?
   a) Prototype (a new instance every time)   b) Singleton (one shared instance)   c) Request-scoped only   d) There is no default

8. Which annotation specifically marks a class as handling data access logic?
   a) `@Controller`   b) `@Service`   c) `@Repository`   d) `@Component` only, with no alternatives

9. What lifecycle hook runs after a Bean's dependencies are fully injected, for custom setup logic?
   a) `@PreDestroy`   b) `@PostConstruct`   c) `@Autowired`   d) `@Component`

10. Why is Field Injection discouraged in professional code?
    a) It is slower at runtime   b) It hides dependencies and makes unit testing harder   c) It is not supported by Spring at all   d) It requires XML configuration

**True / False**

11. Constructor Injection allows dependencies to be declared as `final`.
12. Auto-Configuration can always be overridden with explicit configuration.
13. `@Service` and `@Repository` are entirely unrelated to `@Component`.
14. Component Scanning requires manually listing every class Spring should manage.
15. Under Inversion of Control, a class is responsible for creating its own dependencies directly.

**Debugging Questions**

16. This class will not receive its dependency correctly injected by tests using constructor-based mocking. Identify the issue and rewrite it using Constructor Injection:
```java
@Service
public class OrderService {
    @Autowired
    private OrderRepository repository;
}
```
17. A student places a `@Service`-annotated class in a package entirely outside their main application class's package structure, and Spring fails to find it. Explain why, referencing Component Scanning.
18. A student manually writes `new UserService()` inside another class, expecting its dependencies to be automatically injected by Spring, but gets a `NullPointerException` instead. Explain the mistake.

---

## 📝 Summary

In this chapter, you crossed the bridge from Core Java into Spring Boot. You learned that Spring Boot builds directly on top of the original Spring Framework, replacing extensive manual configuration with sensible, automatic defaults through Auto-Configuration. You learned that Inversion of Control shifts the responsibility for creating and wiring objects away from your own code and into the Spring IoC Container, and that Dependency Injection is the specific mechanism Spring uses to deliver on that principle — with Constructor Injection as the clearly preferred, professional approach, thanks to its testability and its guarantee, via `final` fields, that a Bean can never exist in an incomplete state. You learned how Component Scanning automatically discovers your annotated classes and registers them as Beans, and you traced the full Bean lifecycle from instantiation through destruction. Everything in this chapter is Dependency Inversion and the Factory and Singleton patterns from Chapter 10, fully automated — you were prepared for this moment before you even realized it.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
Continuously loop back to Chapter 10 by name throughout this lesson. Every time you introduce a new Spring concept, explicitly ask the class: "which pattern or principle from the design patterns chapter does this remind you of?" This repeated connection is the single most effective way to make Spring's behavior feel earned and logical, rather than memorized as unexplained framework magic.

**Common student misconceptions:**
- Students frequently believe `@Autowired` is what "creates" the Bean. Clarify that `@Autowired` (or, on constructors, its increasingly optional presence in modern Spring versions) marks where an *already-created* Bean should be *injected* — the actual creation is handled separately by the container based on stereotype annotations.
- Many students assume every single class in a Spring Boot project is automatically Spring-managed. Reinforce, with a live example, that only explicitly annotated classes (or classes registered through other explicit configuration) become Beans — a plain, un-annotated `Customer` data class is not a Bean simply because it exists inside a Spring project.
- Students often view Field Injection and Constructor Injection as purely stylistic choices with no real functional difference. Demonstrate, live, an actual failing unit test caused by field injection's incompatibility with straightforward constructor-based mocking, previewing Chapter 14's testing content.

**Recommended classroom demonstration:**
Live-build a minimal two-class Spring Boot application (`GreetingService` and a `@RestController` that depends on it via Constructor Injection), run it, and use a debugger or simple print statement inside the constructor to show students that Spring itself is calling that constructor and supplying the dependency — not their own code. Watching Spring's container do this work live demystifies the entire chapter's core idea in a way no diagram fully can.
