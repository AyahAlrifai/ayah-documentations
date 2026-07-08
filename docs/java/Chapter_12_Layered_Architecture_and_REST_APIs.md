---
sidebar_label: "Layered Architecture & REST APIs"
sidebar_position: 12
---

# Chapter 12: Layered Architecture & REST API Delivery

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain, from first principles, how a web browser and a server communicate — clients, servers, requests, and responses.
- Explain what HTTP is, and identify the meaning of the most common HTTP methods and status codes.
- Explain what REST is, and what it means for an API to be "RESTful."
- Explain what JSON is, and why it became the standard format for web APIs.
- Explain Spring Boot's layered architecture: Controller, Service, and Repository, and the responsibility of each.
- Trace a request's full journey through Spring's `DispatcherServlet` and Spring MVC.
- Explain what a DTO is, and why it should typically be kept separate from your database Entity.
- Build a complete, working REST endpoint, understanding every single annotation involved.

---

## 📌 Introduction — What Is a Web API, Really?

Almost every modern application you use daily — a banking app, a food delivery app, a social media feed — is really two separate programs working together. There is a **client**: the app or website you actually interact with, running on your phone or in your browser. And there is a **server**: a separate program, usually running on a powerful, always-on computer somewhere else entirely, that stores the real data and performs the real business logic. The client and server communicate with each other over a network, sending structured messages back and forth.

This chapter explains, in full, exactly how that communication works, and how Spring Boot helps you build the server side of that conversation — a Web API.

---

## 🧠 Theory — Client, Server, and HTTP

A **client** is the program that *initiates* a request — your web browser, your phone's mobile app, or even another server acting as a client toward a third server. A **server** is the program that *listens* for incoming requests and sends back a response.

**HTTP** (HyperText Transfer Protocol) is the standardized set of rules that clients and servers use to structure their conversation — it defines exactly how a request should be formatted, and exactly how a response should be formatted, so that any client, written by anyone, can talk to any server, written by anyone else, as long as both sides follow the same shared rules.

```
   CLIENT (Browser, Mobile App)              SERVER (Your Spring Boot Application)

        │                                              │
        │  ─────────  HTTP REQUEST  ──────────────▶   │
        │   "GET /api/v1/users/5"                      │
        │                                              │  (processes the request,
        │                                              │   fetches data, runs logic)
        │  ◀─────────  HTTP RESPONSE  ─────────────    │
        │   Status: 200 OK                             │
        │   Body: { "id": 5, "name": "Alice" }         │
        │                                              │
```

Every HTTP request specifies an **HTTP method**, indicating the *type* of action being requested:

| Method | Typical Purpose |
|---|---|
| `GET` | Retrieve existing data, without changing anything |
| `POST` | Create a brand-new resource |
| `PUT` | Fully replace an existing resource |
| `PATCH` | Partially update an existing resource |
| `DELETE` | Remove an existing resource |

Every HTTP response includes a **status code**, a standardized three-digit number indicating what happened:

| Code Range | Meaning | Common Examples |
|---|---|---|
| `2xx` | Success | `200 OK`, `201 Created` |
| `3xx` | Redirection | `301 Moved Permanently` |
| `4xx` | Client error (the request itself was wrong) | `400 Bad Request`, `404 Not Found` |
| `5xx` | Server error (something broke on the server's side) | `500 Internal Server Error` |

---

## 🧠 Theory — REST and JSON

**REST** (Representational State Transfer) is not a specific technology — it is a set of architectural *conventions* for designing web APIs in a consistent, predictable way. A "RESTful" API typically organizes its functionality around **resources** (nouns, like "users" or "orders"), identified by clear URLs, and uses standard HTTP methods to describe the *action* being taken on that resource, rather than encoding the action into the URL itself.

```
  RESTful (good):                          Non-RESTful (avoid):

  GET    /api/v1/users        →  list users     GET  /api/v1/getAllUsers
  GET    /api/v1/users/5      →  get user 5      GET  /api/v1/getUserById?id=5
  POST   /api/v1/users        →  create a user   GET  /api/v1/createNewUser?name=...
  DELETE /api/v1/users/5      →  delete user 5   GET  /api/v1/deleteUser?id=5
```

Notice how, in the RESTful style, the URL itself always describes *what resource* you're working with (`users`), while the HTTP method describes *what you're doing* to it (`GET` to read, `POST` to create, `DELETE` to remove) — rather than cramming the entire action into the URL as a verb, like `getAllUsers`.

**JSON** (JavaScript Object Notation) is the standard, lightweight text format almost every modern REST API uses to structure the actual data being sent back and forth. It represents data as simple key-value pairs, nested objects, and arrays — human-readable, and easy for virtually every modern programming language to parse.

```json
{
  "id": 5,
  "name": "Alice",
  "email": "alice@example.com",
  "roles": ["ADMIN", "USER"]
}
```

> 💡 **Tip**
> JSON became the dominant format for web APIs (largely replacing an older, more verbose format called XML) primarily because of its simplicity: it maps naturally onto the basic data structures — objects, arrays, strings, numbers, booleans — that essentially every programming language already has built in, making it trivially easy to convert data into JSON, and back, in almost any language.

---

## 🧠 Theory — Spring Boot's Layered Architecture

A well-organized Spring Boot application separates its code into three distinct layers, each with a single, focused responsibility — a direct application of the Single Responsibility Principle from Chapter 10.

```
   INCOMING REQUEST
          │
          ▼
   ┌─────────────────────────────────────────┐
   │  CONTROLLER LAYER (Web)                  │
   │  Receives HTTP requests, validates input,│
   │  returns HTTP responses.                 │
   └─────────────────────────────────────────┘
          │
          ▼
   ┌─────────────────────────────────────────┐
   │  SERVICE LAYER (Business Logic)          │
   │  Implements the actual application       │
   │  rules, coordinates operations,          │
   │  manages transactions.                   │
   └─────────────────────────────────────────┘
          │
          ▼
   ┌─────────────────────────────────────────┐
   │  REPOSITORY LAYER (Data Access)          │
   │  Executes database queries and           │
   │  operations.                             │
   └─────────────────────────────────────────┘
          │
          ▼
       DATABASE
```

- **Controller Layer**: The entry point for the outside world. Its job is narrowly focused: receive an incoming HTTP request, extract and validate whatever data came with it, hand that data off to the Service layer to actually do the work, and translate the Service layer's result back into a proper HTTP response. A well-designed Controller contains essentially **no business logic** of its own.
- **Service Layer**: Where your application's actual business rules live. This is where you'd check "does this user have permission to do this?" or "does this order total need a discount applied?" The Service layer coordinates whatever Repository calls are needed to fulfill a given piece of business logic, and this is also where database *transactions* (a topic covered in Chapter 14) are typically managed.
- **Repository Layer**: Handles the actual mechanics of talking to the database — this is the DAO pattern from Chapter 10, in direct action. The Repository layer knows *how* to fetch or store data; it has no opinion at all about *why* that data is being fetched or stored — that reasoning belongs entirely to the Service layer above it.

> ✅ **Best Practice**
> Keep each layer strictly focused on its own responsibility. A Controller that directly queries the database is skipping the Service and Repository layers entirely, and a Repository that contains business rules is stepping outside its intended purpose. This strict separation is what makes large Spring Boot applications remain manageable and testable, even as they grow to include dozens or hundreds of endpoints.

---

## 🧠 Theory — The Request Lifecycle: `DispatcherServlet` and Spring MVC

When an HTTP request actually arrives at your running Spring Boot application, what happens, mechanically, before your own Controller code even runs? This is handled by **Spring MVC** (Model-View-Controller), and specifically by a central component called the **`DispatcherServlet`**.

```
  1. HTTP Request arrives at the server
          │
          ▼
  2. DispatcherServlet receives it FIRST — the single entry point for ALL requests
          │
          ▼
  3. DispatcherServlet consults the Handler Mapping:
     "which Controller method is registered for this URL and HTTP method?"
          │
          ▼
  4. The matching Controller method is invoked, with the request's data
     already extracted and converted into Java objects
          │
          ▼
  5. Controller delegates to the Service layer, which delegates to the
     Repository layer, and a result comes back up through the chain
          │
          ▼
  6. DispatcherServlet converts the Controller's returned Java object
     back into JSON (or another format), and sends the final HTTP Response
```

> 🧠 **Behind the Scenes**
> The `DispatcherServlet` is often called the "Front Controller" of a Spring MVC application — every single incoming request passes through it first, no matter which of your own Controllers ultimately handles it. This centralization is precisely what allows Spring to apply consistent, cross-cutting behavior — like automatic JSON conversion, validation triggering, and global exception handling (which you'll study in Chapter 14) — uniformly, across your *entire* application, without you needing to repeat that plumbing logic in every individual Controller method yourself.

---

## 🧠 Theory — DTOs vs. Entities

An **Entity** (which you will study fully in Chapter 13) is a class that directly represents a table in your database. A **DTO** (Data Transfer Object) is a *separate* class, used specifically to define exactly what data structure your API accepts as input, or returns as output, over HTTP.

Why not simply use the Entity class directly for both purposes? Because your database structure and your API's public contract are, conceptually, two entirely different concerns, and conflating them creates real problems. An Entity might contain a sensitive `passwordHash` field, or internal bookkeeping fields, that should absolutely never be exposed directly in an API response. An Entity's structure might also need to change for purely internal database reasons, and you generally don't want every such internal change to automatically, silently alter your API's public contract for every client depending on it.

```java
// The DTO — defines exactly what the API accepts as INPUT
public class UserDTO {
    @NotNull(message = "Username cannot be empty")
    @Size(min = 3, max = 15)
    private String username;

    @Email(message = "Must be a valid email format")
    private String email;

    public String getUsername() { return username; }
    public void setUsername(String u) { this.username = u; }
    public String getEmail() { return email; }
    public void setEmail(String e) { this.email = e; }
}
```

Notice the validation annotations — `@NotNull`, `@Size`, `@Email` — directly attached to the DTO's fields. These come from Spring's Bean Validation support, and they let you declare data-integrity rules directly and readably, right where the field itself is defined, rather than writing that validation logic manually, by hand, inside your Controller.

---

## 🧠 Theory — Building a Complete REST Controller

Let's now assemble everything from this chapter into one complete, working example, and explain every single line and annotation.

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody UserDTO userDTO) {
        userService.registerUser(userDTO);
        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.fetchUserById(id);
        return ResponseEntity.ok(user);
    }
}
```

Let's dissect this, annotation by annotation, line by line.

- `@RestController` — This is actually a combination of two separate ideas in one convenient annotation: `@Controller` (registering this class as a Bean that handles web requests, as you learned in Chapter 11) plus `@ResponseBody` (telling Spring to automatically convert whatever Java object each method returns directly into JSON, rather than treating it as the name of an HTML page to render).
- `@RequestMapping("/api/v1/users")` — Declares the base URL path for *every* endpoint defined inside this class. Every method below effectively has this prefix automatically applied to it.
- `private final UserService userService;` and the constructor — This is Constructor Injection, exactly as covered in Chapter 11. Spring automatically supplies the `UserService` Bean when it creates this Controller.
- `@PostMapping` — Maps this specific method to handle `POST` requests arriving at the class's base path (`/api/v1/users`), since no additional path is specified here.
- `@Valid @RequestBody UserDTO userDTO` — `@RequestBody` tells Spring to take the incoming request's JSON body and automatically convert it into a `UserDTO` object. `@Valid` tells Spring to then actively check that object against all the validation annotations we saw on `UserDTO` (`@NotNull`, `@Size`, `@Email`) — if any of them fail, Spring automatically rejects the request with a `400 Bad Request` response, *before* our method body even runs.
- `userService.registerUser(userDTO);` — The Controller delegates the actual business logic entirely to the Service layer, exactly as this chapter's architecture recommends.
- `return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);` — `ResponseEntity` lets us explicitly control both the response body *and* the HTTP status code together. `HttpStatus.CREATED` corresponds to the `201` status code, the conventional, correct response for a successful creation.
- `@GetMapping("/{id}")` — Maps this method to handle `GET` requests at `/api/v1/users/{id}`, where `{id}` is a **path variable** — a dynamic placeholder segment of the URL.
- `@PathVariable Long id` — Extracts that dynamic `{id}` segment directly from the URL, automatically converting it from text into a `Long`, and makes it available as a regular method parameter.
- `return ResponseEntity.ok(user);` — A convenient shorthand for returning a `200 OK` response, with `user` automatically converted into JSON as the response body.

> 💡 **Tip**
> Notice we never manually wrote any JSON-parsing or JSON-generating code anywhere in this Controller. Spring Boot's Auto-Configuration (from Chapter 11) automatically detects a JSON library (typically Jackson) on your classpath, and wires up all the necessary conversion behind the scenes — this is precisely the kind of everyday convenience "convention over configuration" provides.

---

## ⚠ Common Mistakes

1. **Putting business logic directly inside a Controller method**, rather than delegating it to the Service layer, blurring the clean separation of responsibilities this chapter emphasizes.
2. **Exposing a database Entity directly from an API response**, instead of using a dedicated DTO, potentially leaking sensitive or purely internal fields to external clients.
3. **Forgetting `@Valid` on a `@RequestBody` parameter**, silently allowing invalid data (like an empty required field) to reach your Service layer without any automatic rejection.
4. **Using the wrong HTTP method for an action** — for example, using `GET` to actually delete data — which violates REST conventions and can cause serious, unexpected problems, since `GET` requests are often cached, retried, or pre-fetched automatically by browsers and other tools, unaware that they might trigger a destructive side effect.
5. **Ignoring HTTP status codes**, returning a generic `200 OK` for every situation, including actual errors — making it much harder for client applications to programmatically detect and handle failures correctly.

---

## ✅ Best Practices

- Keep Controllers thin: validate input, delegate to the Service layer, and translate the result into an appropriate HTTP response — nothing more.
- Always use dedicated DTOs for both request input and response output, rather than exposing Entities directly.
- Choose HTTP methods and status codes that accurately and conventionally reflect what actually happened, so client applications can rely on them programmatically.
- Apply `@Valid` consistently on every `@RequestBody` parameter that has validation rules defined, so invalid data is rejected automatically, as early as possible.

---

## 🎯 Exercises

**Easy**

1. In your own words, explain the difference between a client and a server.
2. Name the four most common HTTP methods, and briefly describe what each is conventionally used for.
3. What does REST stand for, and what does it mean for an API's URLs to be organized around "resources"?
4. Why did JSON become the dominant format for web APIs?
5. What Spring annotation combines `@Controller` and `@ResponseBody` into one?

**Medium**

6. Explain, in your own words, the responsibility of each of the three architectural layers: Controller, Service, and Repository.
7. Explain what the `DispatcherServlet` does, and why it is described as a "Front Controller."
8. Explain why a DTO is generally preferred over exposing a database Entity directly through an API.
9. Write a `@GetMapping` endpoint that accepts a path variable representing a product ID, and returns a matching `ProductDTO`.
10. Explain what `@Valid` does when placed before a `@RequestBody` parameter, and what happens if validation fails.

**Hard**

11. Design a complete `ProductController` with endpoints for creating a product (`POST`), retrieving one by ID (`GET`), and deleting one by ID (`DELETE`), using proper HTTP methods, status codes, and a dedicated `ProductDTO`.
12. Explain, step by step, the full journey of a `POST /api/v1/users` request, from the moment it arrives at the server to the moment a response is sent back, referencing the `DispatcherServlet`, the Controller, the Service, and the Repository.
13. Explain, in a short paragraph, a realistic scenario where using `GET` for an operation that deletes data could cause a real, damaging problem in production, and describe the correct HTTP method that should have been used instead.

---

## 🧩 Quiz

**Multiple Choice**

1. Which HTTP method is conventionally used to create a new resource?
   a) `GET`   b) `POST`   c) `DELETE`   d) `HEAD`

2. What status code range indicates a client error?
   a) `2xx`   b) `3xx`   c) `4xx`   d) `5xx`

3. What does REST primarily describe?
   a) A specific programming language   b) A set of architectural conventions for web APIs   c) A database engine   d) A JSON parsing library

4. What format do most modern REST APIs use to structure their data?
   a) XML   b) CSV   c) JSON   d) YAML only

5. Which layer should contain the actual business logic in a Spring Boot application?
   a) Controller   b) Service   c) Repository   d) DTO

6. What is the `DispatcherServlet`'s role?
   a) It stores data in the database   b) It is the single entry point that routes every incoming request to the correct Controller method   c) It validates DTOs   d) It compiles Java source code

7. What does `@RequestBody` do?
   a) Sends a response back to the client   b) Converts the incoming request's JSON into a Java object   c) Registers a Controller as a Bean   d) Validates a database entity

8. What does `@PathVariable` extract?
   a) A value from the request's JSON body   b) A dynamic segment from the URL itself   c) An HTTP header   d) A query parameter only

9. Why is a DTO generally preferred over exposing an Entity directly?
   a) DTOs are faster to compile   b) DTOs let you control exactly what data is exposed, separate from internal database structure   c) Entities cannot be serialized to JSON at all   d) There is no real difference

10. What does `@Valid` trigger when placed on a `@RequestBody` parameter?
    a) Automatic database queries   b) Automatic validation against the DTO's validation annotations   c) Automatic JSON formatting   d) Nothing; it is purely decorative

**True / False**

11. In a RESTful API, the HTTP method should indicate the action, while the URL should indicate the resource.
12. `GET` requests are conventionally expected to modify data on the server.
13. The `DispatcherServlet` handles every incoming request before any individual Controller method runs.
14. A Controller should typically contain the bulk of an application's business logic.
15. JSON represents data using key-value pairs, arrays, and nested objects.

**Debugging Questions**

16. A client sends invalid data (a missing required field) to an endpoint using `@RequestBody UserDTO userDTO`, but no `@Valid`, and the invalid data reaches the Service layer unchecked. Identify and fix the missing piece.
17. An endpoint annotated `@GetMapping("/delete/{id}")` actually deletes a resource when called. Explain why this violates REST conventions, and describe the correct fix.
18. A student's API response accidentally includes a user's hashed password field. Explain the likely architectural mistake, referencing DTOs and Entities.

---

## 📝 Summary

In this chapter, you built a complete, first-principles understanding of how web APIs actually work: clients and servers communicating over HTTP, using standardized methods and status codes, following REST conventions to organize functionality around resources, and exchanging data using JSON. You learned Spring Boot's layered architecture — Controller, Service, and Repository — and the single, focused responsibility each layer carries. You traced a request's actual journey through the `DispatcherServlet`, Spring MVC's central front controller, from arrival to response. You learned why DTOs, not Entities, should define your API's public contract, and how Bean Validation annotations let you declare data-integrity rules directly and readably. Finally, you assembled everything into a complete, working `UserController`, understanding exactly what every single annotation — `@RestController`, `@RequestMapping`, `@PostMapping`, `@RequestBody`, `@Valid`, `@PathVariable` — actually does, and why.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
Before writing a single line of Spring code, have students manually construct a raw HTTP request using a tool like `curl` or Postman against a simple, pre-built demo endpoint, and let them inspect the raw response, including its status code and headers, directly. Understanding HTTP as a genuinely simple, readable text protocol underneath all the framework abstraction pays enormous dividends throughout the rest of this book.

**Common student misconceptions:**
- Students frequently believe REST is a specific technology or library, rather than a set of architectural conventions that can be followed to varying degrees. Emphasize, with contrasting URL examples like the ones shown in this chapter, that REST is fundamentally about *design discipline*, not a piece of software you install.
- Many students assume DTOs and Entities are redundant duplication and are tempted to skip DTOs entirely, directly returning Entities from Controllers to save typing. Walk through a concrete security-focused example, like a leaked password hash, to make the real-world cost of skipping this separation tangible.
- Students often struggle to see why a request needs to pass through three separate layers instead of just querying the database directly inside the Controller. Revisit the Single Responsibility Principle from Chapter 10 explicitly here, and ask students to imagine a business rule change (like adding a new validation step) and trace exactly which single layer would need to change under the layered design, versus a flattened, all-in-one-class design.

**Recommended classroom demonstration:**
Live-build the complete `UserController` example from this chapter, step by step, running it after each new annotation is added, and testing it with a real HTTP client (like Postman or `curl`) after every meaningful change. Show students what happens when they deliberately send invalid data (triggering `@Valid`'s automatic rejection) versus valid data, so the effect of validation is felt directly, not just described.
