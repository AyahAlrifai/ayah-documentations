---
sidebar_label: "Global Exception Handling, Testing & Docker"
sidebar_position: 14
---

# Chapter 14: Global Exception Handling, Testing & Docker

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain why centralized, global exception handling is preferable to repetitive `try-catch` blocks scattered across Controllers.
- Build a global exception handler using `@ControllerAdvice` and `@ExceptionHandler`.
- Explain the difference between Unit Tests and Integration Tests, and when each is appropriate.
- Write Unit Tests using JUnit 5, and mock dependencies using Mockito.
- Write Integration Tests using `@SpringBootTest`.
- Explain what Docker is, and why containerization solves the "it works on my machine" problem.
- Read and explain a multi-stage Dockerfile for a Spring Boot application.

---

## 📌 Introduction — Finishing the Journey

This is the final chapter of this book, and it brings together three concerns that separate a working application from a genuinely **professional**, production-ready one. Up to this point, your Spring Boot applications have handled the "happy path" — successful requests, valid data, everything working as expected. Real applications must also handle failure gracefully, must be verifiably correct through automated testing, and must be deployable consistently across every environment they'll ever run in — a developer's laptop, a testing server, and production. This chapter addresses all three.

---

## 🧠 Theory — Global Exception Handling with `@ControllerAdvice`

Back in Chapter 6, you learned how `try-catch` blocks handle exceptions locally, wherever they're written. But imagine dozens of different Controller methods across a large application, each one needing to handle the same kinds of failures — a resource not found, invalid input, a database error — consistently, with the same well-structured JSON error response format. Writing a repetitive `try-catch` block, with identical error-formatting logic, inside every single Controller method, violates the DRY (Don't Repeat Yourself) spirit behind the Single Responsibility Principle from Chapter 10, and makes it far too easy for error responses to drift out of consistency with each other over time.

Spring solves this with **`@ControllerAdvice`** — a special class that centralizes exception handling for your *entire* application, in exactly one place.

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}
```

Let's explain this carefully.

- `@ControllerAdvice` — Registers this class as a special, global Bean (recall Beans and stereotype annotations from Chapter 11) that Spring automatically applies *across every Controller in the entire application*, rather than being tied to just one specific Controller class.
- `@ExceptionHandler(UserNotFoundException.class)` — Declares that the method immediately below should run specifically whenever a `UserNotFoundException` (a custom exception, exactly like the ones you learned to build in Chapter 6) is thrown anywhere within *any* Controller in the application, no matter how deeply nested inside the Service or Repository layers that exception originally occurred.
- `ErrorResponse error = new ErrorResponse(...)` — Constructs a consistent, structured error object (a simple class you'd define yourself, typically holding a status code and a message) to be sent back to the client.
- `return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);` — Returns that structured error, along with the appropriate `404 Not Found` HTTP status code, exactly matching what you learned about `ResponseEntity` in Chapter 12.

```
   WITHOUT @ControllerAdvice:              WITH @ControllerAdvice:

   Controller A: try-catch + format JSON   Controller A: (throws exception, nothing more)
   Controller B: try-catch + format JSON   Controller B: (throws exception, nothing more)
   Controller C: try-catch + format JSON   Controller C: (throws exception, nothing more)
                                                     │
                                                     ▼
                                          ONE GlobalExceptionHandler
                                          catches and formats ALL of them,
                                          consistently, in a single place
```

> ✅ **Best Practice**
> Define one custom exception per distinct business failure condition (as you learned in Chapter 6), and register a matching `@ExceptionHandler` for each one inside a single, centralized `GlobalExceptionHandler` class. This keeps your Controllers focused purely on their intended responsibility, while guaranteeing that every error response returned by your entire API follows one single, consistent, predictable structure.

---

## 🧠 Theory — Testing: Unit Tests vs. Integration Tests

Writing code that appears to work is not the same as *proving* it works, and continuing to prove it keeps working as the codebase changes over time. **Automated testing** is how professional software teams gain this confidence, running quickly, repeatedly, and without requiring a human to manually click through the application after every single change.

Java's testing ecosystem centers on two complementary tools: **JUnit 5**, the framework for actually structuring, running, and reporting on tests, and **Mockito**, a library for creating fake, controllable stand-ins for real dependencies.

### Unit Tests — Testing One Class, In Complete Isolation

A **Unit Test** verifies the behavior of a single class, entirely on its own, deliberately isolated from every other real class it might normally depend on. Real dependencies are replaced with **mocks** — fake objects that behave exactly however you instruct them to for the purposes of that specific test.

```java
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    public void testGetUser_Success() {
        // Arrange
        User mockUser = new User(1L, "Alice");
        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act
        UserDTO result = userService.fetchUserById(1L);

        // Assert
        Assertions.assertNotNull(result);
        Assertions.assertEquals("Alice", result.getUsername());
    }
}
```

Let's dissect this test, which is structured using the extremely common and highly readable **Arrange-Act-Assert** pattern.

- `@ExtendWith(MockitoExtension.class)` — Activates Mockito's integration with JUnit 5, enabling the `@Mock` and `@InjectMocks` annotations below.
- `@Mock private UserRepository userRepository;` — Creates a completely fake, controllable `UserRepository`. This is *not* a real repository connected to any actual database — every one of its methods, by default, does nothing at all, unless we explicitly program it to behave a certain way, as we do below.
- `@InjectMocks private UserService userService;` — Creates a real `UserService` instance, and automatically injects our fake `userRepository` mock into it — this is exactly why Chapter 11 emphasized Constructor Injection so strongly: Mockito relies on being able to cleanly supply mock dependencies through a class's constructor, precisely as it's doing here.
- **Arrange**: `Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));` — This line explicitly programs our fake repository's behavior for this specific test: "whenever `findById(1L)` is called on this mock, pretend a matching user was actually found."
- **Act**: `UserDTO result = userService.fetchUserById(1L);` — This is the actual method under test, being called exactly as it would be in real application code — except it is silently using our controlled, fake repository underneath, instead of a real database connection.
- **Assert**: `Assertions.assertNotNull(result); Assertions.assertEquals("Alice", result.getUsername());` — These lines verify that the method's actual behavior matches our expectations. If either assertion fails, JUnit reports this specific test as failed, along with a clear explanation of exactly what was expected versus what was actually returned.

> 💡 **Tip**
> Unit Tests are deliberately fast — often running in mere milliseconds — precisely because they never touch a real database, a real network connection, or any other genuinely slow, external resource. This speed is what allows developers to run their entire suite of Unit Tests constantly, after nearly every small code change, catching mistakes within seconds rather than minutes or hours.

### Integration Tests — Verifying Real Components Working Together

A **Unit Test** deliberately isolates one class using mocks. An **Integration Test**, by contrast, verifies that multiple *real* components — Controllers, Services, Repositories, and often a genuine (though typically temporary, test-specific) database — correctly work together as an actual, connected whole.

```java
@SpringBootTest
public class UserIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    public void testFullUserRegistrationFlow() {
        UserDTO dto = new UserDTO();
        dto.setUsername("bob123");
        dto.setEmail("bob@example.com");

        userService.registerUser(dto);

        Optional<Customer> saved = customerRepository.findByEmail("bob@example.com");
        Assertions.assertTrue(saved.isPresent());
    }
}
```

`@SpringBootTest` tells Spring to actually start up the **entire real application context** for this test — genuinely creating real Beans, wiring real dependency injection, exactly as Chapter 11 described, rather than substituting fake mocks anywhere in the chain. This gives you much higher confidence that your components genuinely integrate correctly together, at the cost of running significantly slower than a Unit Test, since real infrastructure is genuinely being started up and exercised.

| | Unit Test | Integration Test |
|---|---|---|
| Scope | One class, in isolation | Multiple real components working together |
| Dependencies | Mocked (fake) | Real (or a realistic test substitute) |
| Speed | Very fast (milliseconds) | Slower (seconds) |
| Primary annotation | `@Mock`, `@InjectMocks` | `@SpringBootTest` |

> ✅ **Best Practice**
> A healthy, professional test suite typically contains far more Unit Tests than Integration Tests — often described as a "testing pyramid," with a large base of fast Unit Tests, and a smaller number of slower, more comprehensive Integration Tests reserved for verifying that the most critical, end-to-end flows genuinely work correctly across real, wired-together components.

---

## 🧠 Theory — Docker: Consistent Environments, Every Time

You have now built a complete, tested Spring Boot application. The final challenge: getting it to run correctly, not just on your own development machine, but on a testing server, and eventually in production — reliably, consistently, regardless of what operating system, what installed software versions, or what other configuration differences those environments might have compared to your own computer.

The infamous phrase "well, it works on my machine" describes exactly this problem: an application that behaves correctly in one environment, but mysteriously breaks in another, due to subtle environmental differences — a different Java version installed, a missing system library, a different operating system entirely.

**Docker** solves this by packaging your application together with its *entire* required runtime environment — the exact JDK version it needs, any required system libraries, precise configuration — into a single, self-contained, portable unit called a **container image**. That image then runs identically, in complete isolation from whatever else happens to be installed on the host machine, regardless of whether that host is a developer's laptop, a testing server, or a production cloud environment.

> **Real-World Analogy**
> Think of a Docker container like a shipping container in international freight. Before standardized shipping containers existed, cargo had to be loaded and unloaded by hand at every single port, using whatever equipment that specific port happened to have, in whatever format that particular ship or truck required. The shipping container standardized this completely: any crane, any ship, any truck, anywhere in the world, can handle the exact same standardized container, without caring at all about what's actually packed inside it. Docker does the same thing for software: any server, running Docker, anywhere, can run your exact container, without needing to individually replicate your specific development environment's setup by hand.

---

## 🧠 Theory — Understanding a Multi-Stage Dockerfile

A `Dockerfile` is a plain text file containing step-by-step instructions describing exactly how to build a container image for your application.

```dockerfile
# Production Grade Multi-stage Dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Let's explain this line by line. Notice this file is split into **two separate stages** — this is called a **multi-stage build**, and it exists for a specific, deliberate reason we'll explain once we've walked through the mechanics.

**Stage 1 — "build"**

- `FROM maven:3.9-eclipse-temurin-17 AS build` — Starts from a pre-built base image that already contains both Maven and a full JDK (everything a "chef," to borrow Chapter 1's restaurant analogy, needs to actually *build* the application). We name this stage `build`, so we can refer back to it later.
- `WORKDIR /app` — Sets `/app` as the working directory inside the container for all subsequent instructions.
- `COPY . .` — Copies your entire project's source code from your local machine into the container's `/app` directory.
- `RUN mvn clean package -DskipTests` — Runs the Maven build lifecycle you learned about in Chapter 9, compiling the source code and packaging it into a runnable `.jar` file. `-DskipTests` skips running the test suite during this particular build step, since tests are typically run separately, earlier, as part of a broader automated pipeline.

**Stage 2 — The Final, Much Smaller Image**

- `FROM eclipse-temurin:17-jre-jammy` — Starts a **brand new, separate stage**, this time based on a much smaller image that contains only a JRE (recall from Chapter 1: everything needed to *run* a Java application, but not the full JDK's development tools, and definitely not all of Maven).
- `COPY --from=build /app/target/*.jar app.jar` — This is the key move of a multi-stage build: it copies *only* the final, compiled `.jar` file out of the first `build` stage, into this new, clean, minimal stage — leaving behind the entire Maven installation, the full JDK, and all your raw source code, none of which are actually needed to *run* the finished application.
- `EXPOSE 8080` — Documents that this container expects to receive network traffic on port `8080`, the default port Spring Boot applications typically run on.
- `ENTRYPOINT ["java", "-jar", "app.jar"]` — Specifies the actual command that runs automatically the moment a container is started from this image: launch the JVM, and run our packaged application.

> 🧠 **Behind the Scenes**
> Why bother with two separate stages at all, rather than just building and running everything in one single image? Because the final image that actually gets deployed to production should be as small, clean, and minimal as realistically possible — every unnecessary tool included in a production image (a full JDK, Maven itself, your raw uncompiled source code) represents both wasted disk space and, more importantly, unnecessary attack surface from a security perspective. The multi-stage build lets you use a large, fully-equipped "workshop" image to actually *build* the application, while shipping only the small, clean, finished "product" — the compiled `.jar` file alone — inside the final image that will actually run in production.

---

## ⚠ Common Mistakes

1. **Scattering repetitive `try-catch` blocks across many Controllers**, instead of centralizing consistent error handling with a single `@ControllerAdvice` class.
2. **Writing only Integration Tests, and skipping fast Unit Tests entirely**, resulting in a slow-running test suite that developers become reluctant to run frequently, undermining the entire purpose of automated testing.
3. **Forgetting to actually program a mock's expected behavior** (omitting the `Mockito.when(...).thenReturn(...)` setup), leading to confusing test failures where a mock silently returns `null` or a meaningless default value instead of the expected test data.
4. **Building a single-stage Docker image that includes the entire JDK and Maven installation in the final, deployed image**, producing an unnecessarily large and less secure production artifact.
5. **Forgetting `EXPOSE` or misconfiguring the exposed port**, leading to confusion when a running container appears healthy internally, but cannot actually be reached from outside the container.

---

## ✅ Best Practices

- Centralize all custom exception handling in a single `@ControllerAdvice` class, keeping every Controller focused purely on its own core responsibility.
- Favor a large base of fast Unit Tests, reserving slower Integration Tests for genuinely critical, end-to-end verification.
- Always follow the Arrange-Act-Assert structure when writing tests — it keeps even complex test methods easy to read and understand at a glance.
- Use multi-stage Docker builds for any real, production-bound Spring Boot application, keeping the final deployed image as small and minimal as reasonably possible.

---

## 🎯 Exercises

**Easy**

1. What annotation registers a class as a global, application-wide exception handler?
2. In one sentence, describe the key difference between a Unit Test and an Integration Test.
3. What Mockito annotation creates a fake, controllable version of a dependency?
4. What does the `EXPOSE` instruction in a Dockerfile document?
5. True or false, with justification: "Integration Tests generally run faster than Unit Tests."

**Medium**

6. Write a `@ExceptionHandler` method inside a `@ControllerAdvice` class that handles a custom `InvalidOrderException`, returning a `400 Bad Request` status.
7. Write a Mockito-based Unit Test for a method that returns `Optional.empty()` when a repository lookup fails to find a match, verifying the Service correctly handles that empty case.
8. Explain why `@InjectMocks` relies specifically on Constructor Injection, connecting this back to what you learned in Chapter 11.
9. Explain, in your own words, why a multi-stage Dockerfile produces a smaller final image than a single-stage equivalent.
10. Explain the "testing pyramid" concept, and why most tests in a healthy test suite are typically Unit Tests rather than Integration Tests.

**Hard**

11. Design a complete `GlobalExceptionHandler` class handling at least three different custom exceptions, each mapped to an appropriate, distinct HTTP status code.
12. Write both a Unit Test (using Mockito) and an Integration Test (using `@SpringBootTest`) for the same simple `ProductService.findProduct(id)` method, and explain, in comments, exactly what each test is actually verifying that the other one is not.
13. Write a complete multi-stage Dockerfile for a hypothetical Spring Boot application of your choosing, and explain, in a short paragraph, each stage's specific purpose.

---

## 🧩 Quiz

**Multiple Choice**

1. What annotation centralizes exception handling across an entire Spring Boot application?
   a) `@ExceptionHandler` alone   b) `@ControllerAdvice`   c) `@RestController`   d) `@Service`

2. What does `@Mock` create in a Mockito-based test?
   a) A real database connection   b) A fake, controllable stand-in for a dependency   c) A new Spring Bean in the real application context   d) A compiled `.jar` file

3. What does `@InjectMocks` do?
   a) Starts the full Spring application context   b) Creates the real object under test and injects its mocked dependencies into it   c) Deletes all mocks after a test   d) Registers a Controller

4. What annotation starts the real, full Spring application context for a test?
   a) `@Mock`   b) `@Test`   c) `@SpringBootTest`   d) `@ControllerAdvice`

5. Which type of test typically runs faster?
   a) Integration Test   b) Unit Test   c) They are always identical in speed   d) Neither ever completes

6. What does Docker primarily solve?
   a) Writing SQL queries   b) Inconsistent behavior across different environments   c) Slow compilation times   d) Validating REST request bodies

7. What is the purpose of a multi-stage Dockerfile?
   a) To build multiple unrelated applications at once   b) To keep the final image small by excluding unnecessary build tools   c) To run tests automatically   d) To replace Maven entirely

8. What does `EXPOSE 8080` do in a Dockerfile?
   a) Automatically opens the port on the host machine   b) Documents which port the container expects to receive traffic on   c) Starts the Spring Boot application   d) Installs Java 8

9. What pattern structures most well-written unit tests, as shown in this chapter?
   a) Create-Read-Update   b) Arrange-Act-Assert   c) Request-Response-Retry   d) Build-Test-Deploy

10. What is the primary advantage of Unit Tests over Integration Tests?
    a) They test more real components at once   b) They run significantly faster, due to isolation via mocking   c) They require a real database   d) They are always more accurate

**True / False**

11. `@ControllerAdvice` applies globally, across every Controller in the application.
12. Integration Tests use real, wired-together Spring Beans rather than mocks.
13. A multi-stage Dockerfile's final image typically includes the full JDK and Maven installation.
14. Mockito allows you to explicitly program exactly how a mocked method should behave for a given test.
15. A healthy test suite typically contains far more Integration Tests than Unit Tests.

**Debugging Questions**

16. A Unit Test using `@Mock` and `@InjectMocks` fails because a mocked repository method unexpectedly returns `null` instead of the expected test data. Identify the likely missing step.
17. A student's final Docker image is unexpectedly large, containing a full Maven installation and raw source code. Explain the likely mistake in the Dockerfile.
18. Two different Controllers in a project each implement their own separate, slightly inconsistent JSON error format. Explain how `@ControllerAdvice` would resolve this inconsistency.

---

## 📝 Summary

In this final chapter, you completed your journey into professional, production-ready Spring Boot development. You learned how `@ControllerAdvice` and `@ExceptionHandler` centralize exception handling across an entire application, replacing repetitive, inconsistent `try-catch` blocks with a single, consistent source of truth for error responses. You learned the crucial distinction between Unit Tests, which isolate a single class using Mockito's fake, controllable mocks, and Integration Tests, which verify real, wired-together components using `@SpringBootTest` — and why a healthy test suite favors a large base of the former. Finally, you learned what Docker actually does, why the "it works on my machine" problem exists, and how a multi-stage Dockerfile builds your application in a full-featured environment while shipping only the small, clean, finished artifact to production. You now hold, in these fourteen chapters, a complete, first-principles path from a total beginner's very first line of Java code, all the way through to a fully tested, containerized, professional Spring Boot application.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
Treat this chapter as a genuine capstone. Where possible, have students take a small application they've built across the earlier Spring Boot chapters and retrofit it with a `GlobalExceptionHandler`, a small suite of Unit and Integration Tests, and a working multi-stage Dockerfile, rather than starting from a fresh example — applying these three concerns to something students already understand deeply reinforces the material far more effectively than another new, unfamiliar codebase would.

**Common student misconceptions:**
- Students often believe mocks somehow test "real" behavior, and are surprised when a mocked method they forgot to configure silently returns `null` rather than realistic data. Reinforce clearly that a mock does exactly, and only, what you explicitly program it to do — nothing more.
- Many students assume more tests, of any kind, are unconditionally better, without appreciating the real cost of a slow-running test suite dominated by heavy Integration Tests. Discuss the testing pyramid explicitly, and if possible, show a live, timed comparison between a small Unit Test suite and an equivalent Integration Test suite.
- Students frequently find multi-stage Dockerfiles confusing on first read, since it looks like "two files in one." Walk through the file top to bottom, explicitly labeling which stage is currently "active" at each instruction, and emphasize that `COPY --from=build` is the single line doing the real, deliberate work of crossing between the two stages.

**Recommended classroom demonstration:**
Build and run a Docker image from the multi-stage Dockerfile shown in this chapter, live, and use `docker images` to show students the final image's size. Then, as a contrast, briefly build a single-stage equivalent (skipping the second `FROM` and `COPY --from=build` entirely) and compare the two resulting image sizes side by side. The size difference is often dramatic, and makes the abstract benefit of multi-stage builds immediately concrete.
