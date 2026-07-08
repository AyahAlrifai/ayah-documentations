---
sidebar_label: "OOP in Depth"
sidebar_position: 3
---

# Chapter 3: Object-Oriented Programming in Depth

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain the difference between a class and an object, and why this distinction is the foundation of everything else in this chapter.
- Write constructors correctly, and explain exactly what the `this` keyword resolves and why it is needed.
- Explain encapsulation, and demonstrate how private fields combined with public getters and setters protect an object's internal integrity.
- Explain inheritance, use the `extends` and `super` keywords correctly, and describe what each of Java's four access modifiers actually controls.
- Explain the difference between compile-time polymorphism (overloading) and runtime polymorphism (overriding), and predict which method Java will actually call in a given scenario.
- Explain the structural difference between an abstract class and an interface, and choose the correct one for a given design problem.
- Recognize and avoid the most common beginner mistakes in object-oriented design.

---

## 📌 Introduction — Why Model Software Around "Objects"?

Before object-oriented programming became the dominant style, most software was organized as a long list of instructions and separate data structures that had no strong connection to each other. As programs grew larger, this became genuinely difficult to manage — data could be changed from anywhere, by anything, with no rules protecting it, and understanding "what can affect this value" required reading the entire program.

Object-Oriented Programming (OOP) proposes a different way of organizing software: model your program as a collection of self-contained **objects**, each bundling together its own data and the behavior that operates on that data. A `BankAccount` object doesn't just store a balance number floating around in the program — it *owns* that balance, and it is the only thing allowed to directly change it, through clearly defined actions like `deposit()` and `withdraw()`.

This chapter is the single most important chapter in the "Core Java" phase of this book. Nearly every professional Java codebase you will ever work in — and certainly every Spring Boot application you will build starting in Phase 3 — is structured entirely around the concepts introduced here: classes, objects, encapsulation, inheritance, and polymorphism. Take your time with this chapter. Reread sections if needed. Everything after this point assumes you are comfortable with what follows.

---

## 🧠 Theory — Classes and Objects

### The Blueprint and the House

> **Real-World Analogy**
> A **class** is an architectural blueprint for a house. It describes what every house built from it *will have* — how many bedrooms, what the layout looks like, where the plumbing goes. But a blueprint is just paper. You cannot sleep inside a blueprint, cook inside a blueprint, or live inside a blueprint.
>
> An **object** is an actual, physical house built from that blueprint, standing on a real street corner. You can build many different houses from the exact same blueprint — each one is a separate, independent object, with its own address, its own furniture, and its own current state — even though they all share the identical structural design defined by the blueprint.

In Java terms: a **class** is the code you write that *describes* what data (fields) and behavior (methods) something will have. An **object** is a specific instance of that class, created at runtime using the `new` keyword, that actually exists in memory (on the Heap, as you learned in Chapter 1) and holds real values.

```java
public class Car {
    // Fields describe WHAT DATA every Car object will have
    private String model;
    private int year;
}
```

```java
// Creating actual OBJECTS (instances) from the Car class blueprint
Car car1 = new Car();
Car car2 = new Car();
// car1 and car2 are two completely separate objects, even though
// they were both built from the exact same Car class.
```

### Constructors — Setting Up a New Object Correctly

A **constructor** is a special method that runs automatically the moment an object is created with `new`. Its job is to set up the object's initial state — typically, assigning starting values to its fields.

```java
public class Car {
    private String model;

    // This is the CONSTRUCTOR — notice it has NO return type,
    // and its name is IDENTICAL to the class name.
    public Car(String model) {
        this.model = model;
    }
}
```

Let's dissect this line by line.

- `public Car(String model) { ... }` — This declares a constructor. You know it's a constructor, not a regular method, because it has no return type at all (not even `void`), and its name exactly matches the class name, `Car`.
- `String model` — This is a **parameter**. It is a local variable that only exists for the duration of the constructor call, holding whatever value was passed in when the object was created (for example, `new Car("Tesla Model 3")`).
- `this.model = model;` — This is where beginners most often get confused, and it deserves a full explanation.

### The `this` Keyword — Resolving a Naming Collision

Notice that the constructor's parameter is named `model`, and the class's field is *also* named `model`. This is an extremely common and completely intentional pattern in professional Java code — but it creates an ambiguity: inside the constructor body, does the bare word `model` refer to the parameter, or the field?

Java's rule is: **the closest matching variable wins**. Since the parameter `model` is declared right there in the constructor's parentheses, it is considered "closer" than the field, and any bare reference to `model` inside the constructor refers to the parameter — not the field.

The `this` keyword is Java's explicit way of saying "I specifically mean the field belonging to this exact object, not the parameter, no matter which one is closer." `this.model` unambiguously means "the `model` field that belongs to the object currently being constructed." `model` (without `this.`) means "the parameter."

```java
public Car(String model) {
    this.model = model;
    //   ↑        ↑
    //   The      The parameter
    //   FIELD    (the incoming value)
}
```

> 💡 **Tip**
> You are not *required* to name your parameters identically to your fields — you could write `public Car(String incomingModel) { this.model = incomingModel; }` and the ambiguity would never arise in the first place. But matching the names, combined with `this.`, is the overwhelmingly standard convention in professional Java code, because it keeps parameter names meaningful and self-documenting.

---

## 🧠 Theory — Encapsulation: Protecting an Object's Integrity

**Encapsulation** is the practice of hiding an object's internal data from direct outside access, and instead forcing all interaction to go through a controlled, deliberate set of public methods.

Consider a `BankAccount` class with a `balance` field. If that field were `public`, any piece of code anywhere in the entire program could reach in and directly rewrite it — including setting it to an impossible value like `-500`, bypassing every business rule the bank might need to enforce.

```java
public class BankAccount {
    private double balance;   // 'private' — hidden from the outside world entirely

    public void deposit(double amount) {
        if (amount > 0) {                 // Encapsulated business rule guard
            this.balance += amount;
        }
    }

    public double getBalance() {
        return this.balance;
    }
}
```

Let's explain this design decision carefully.

- `private double balance;` — By marking this field `private`, no code outside of the `BankAccount` class itself can ever directly read or write it. There is no way to write `account.balance = -500;` from outside the class — the compiler will refuse to allow it.
- `public void deposit(double amount) { if (amount > 0) { ... } }` — This is the *only* sanctioned way to increase the balance, and it includes a validation rule: negative or zero deposits are silently rejected. This rule is now impossible to bypass, because it is the sole gateway to modifying `balance`.
- `public double getBalance() { return this.balance; }` — This is a **getter** — a controlled, read-only way for outside code to view the current balance, without being able to modify it directly.

This pattern — `private` fields, paired with `public` getter and (when appropriate) setter methods — is called **encapsulation**, and it is one of the four foundational pillars of object-oriented programming.

> ✅ **Best Practice**
> Default to making every field `private` unless you have a specific, deliberate reason not to. Then expose only the getters and setters that are actually necessary — and put validation logic inside setters (or dedicated methods, like `deposit()` above) whenever a field has rules about what values are actually allowed.

---

## 🧠 Theory — Inheritance: Sharing Behavior Between Related Classes

**Inheritance** allows one class (the **child** or **subclass**) to automatically receive the fields and methods of another class (the **parent** or **superclass**), using the `extends` keyword. This avoids duplicating identical code across multiple related classes.

> **Real-World Analogy**
> Think of inheritance like family genetics. A child inherits traits from their parent automatically — eye color, height tendencies, and so on — without having to be manually "taught" those traits from scratch. The child can also develop their own unique traits on top of what they inherited, and in some cases, can even override an inherited trait with something different.

```java
class Animal {
    void makeSound() {
        System.out.println("Generic Sound");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println("Bark!");
    }

    void bark(int times) {
        for (int i = 0; i < times; i++) {
            System.out.println("Bark");
        }
    }
}
```

- `class Dog extends Animal` — This declares that `Dog` is a subclass of `Animal`. Every `Dog` object automatically has everything `Animal` has, plus anything additional that `Dog` defines itself.
- `@Override void makeSound() { ... }` — `Dog` is providing its *own* version of `makeSound()`, replacing the generic version inherited from `Animal`. The `@Override` annotation is not strictly required by the compiler, but it is extremely good practice: it tells the compiler "I intend to be overriding a parent method here," and the compiler will produce a helpful error if you accidentally misspell the method name or get its signature wrong — catching a whole category of silent bugs before they ever happen.
- `void bark(int times) { ... }` — This method exists *only* on `Dog`, not on `Animal`. A generic `Animal` reference cannot call `bark()`, because as far as `Animal` is concerned, that method doesn't exist.

### The `super` Keyword

Just as `this` refers to the current object, `super` refers specifically to the **parent class**, and is most commonly used to call a parent's constructor or to call a parent's version of a method that has been overridden.

```java
class Vehicle {
    protected String brand;
    public Vehicle(String brand) {
        this.brand = brand;
    }
}

class Motorcycle extends Vehicle {
    public Motorcycle(String brand) {
        super(brand);   // Calls Vehicle's constructor to handle the shared setup
    }
}
```

`super(brand)` explicitly invokes `Vehicle`'s constructor, passing `brand` along, so that `Motorcycle` doesn't need to repeat the field-assignment logic that `Vehicle` already handles.

### Access Modifiers — Controlling Visibility

Java gives you four distinct levels of visibility for fields, methods, and classes. Choosing the right one is a core design skill.

| Modifier | Visible From |
|---|---|
| `private` | Only inside the exact same class |
| *(no modifier / default)* | Any class within the same package |
| `protected` | Same package, **plus** any subclass, anywhere, even in a different package |
| `public` | Anywhere in the entire codebase, with no restriction |

> 💡 **Tip**
> A helpful mental ordering, from most restrictive to least restrictive: `private` → *default* → `protected` → `public`. As a general design principle, always choose the **most restrictive** modifier that still allows your code to work correctly. Wider visibility should be a deliberate choice, never a default habit.

---

## 🧠 Theory — Polymorphism: One Name, Many Behaviors

"Polymorphism" literally means "many forms." In Java, it refers to the ability of a single method name to behave differently depending on context. There are two distinct kinds, and beginners frequently confuse them, so we will separate them very clearly.

### Overloading — Compile-Time Polymorphism

**Overloading** means defining multiple methods **in the same class**, sharing the **same name**, but with different parameter lists (different number, order, or types of parameters).

```java
class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    double add(double a, double b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }
}
```

All three methods are named `add`, but Java can always tell them apart, because their **parameter signatures** are different. This decision happens entirely at **compile time** — the compiler looks at the arguments you provide in your source code and locks in exactly which version of `add` will be called, before the program ever runs.

### Overriding — Runtime Polymorphism

**Overriding**, which we already saw in the `Dog`/`Animal` example above, means a subclass provides its *own* implementation of a method that its parent class already defines, using an identical method signature. Unlike overloading, this decision is **not** made at compile time — it is made at **runtime**, based on the actual, real object type sitting in memory, regardless of what type the variable was *declared* as.

```java
Animal myPet = new Dog();   // Declared type: Animal.  Actual object type: Dog.
myPet.makeSound();          // Prints "Bark!" — NOT "Generic Sound"
```

This is a genuinely surprising result for beginners the first time they see it, so let's explain exactly why it happens.

> 🧠 **Behind the Scenes**
> Even though the variable `myPet` is *declared* with the type `Animal`, the *actual object* it points to on the Heap is a `Dog`. When you call `myPet.makeSound()`, the JVM does not simply look at the declared type of the variable and blindly call `Animal`'s version. Instead, it looks at the real, actual object sitting in memory, checks its true type, and calls **that** type's version of the method — walking up the inheritance chain only if the actual type doesn't override the method itself. This mechanism is what allows you to write code that works correctly with *any* subclass of `Animal`, without needing to know in advance exactly which specific subclass you'll be given — a hugely powerful tool for writing flexible, extensible software, and a pattern you will see constantly once we reach Spring Boot's dependency injection model in Phase 3.

```
       Compile-Time (Overloading)              Runtime (Overriding)

  Decided by: number/type of arguments    Decided by: the ACTUAL object type
  Decided when: before the program runs   Decided when: while the program is running
  Same class, different signatures        Parent/child classes, same signature
```

---

## 🧠 Theory — Abstract Classes vs. Interfaces

Both abstract classes and interfaces let you define a "contract" that other classes must fulfill, but they serve genuinely different design purposes, and choosing correctly between them is an important architectural skill.

### Abstract Classes — Modeling "Is-A" Relationships

An **abstract class** is a class that cannot be directly instantiated with `new` — it exists purely to be extended by subclasses. It can contain a mixture of fully-implemented methods (shared behavior every subclass automatically gets) and **abstract methods** — methods with no body at all, which every concrete (non-abstract) subclass is *required* to implement itself.

```java
abstract class Shape {
    protected String color;   // Shared STATE (field) — something interfaces traditionally could not have

    public Shape(String color) {
        this.color = color;
    }

    void printColor() {       // A fully implemented, SHARED method
        System.out.println("Color: " + color);
    }

    abstract double calculateArea();   // An ABSTRACT method — no body; subclasses MUST implement it
}
```

Use an abstract class when multiple related classes genuinely share common **state** (fields) or common, ready-to-use behavior, and the relationship between them is naturally an "is-a" relationship — a `Circle` *is a* `Shape`, a `Square` *is a* `Shape`.

### Interfaces — Modeling "Can-Do" Capabilities

An **interface** defines a contract — a set of method signatures that any implementing class promises to provide — without describing *how* those methods work internally, and (traditionally) without holding any object state at all. Modern Java (8+) also allows interfaces to include **default methods** (a method with an actual body, that implementing classes inherit automatically unless they choose to override it) and `static` utility methods.

```java
interface Printable {
    void print();

    default void printTwice() {   // A DEFAULT method — has a real implementation
        print();
        print();
    }
}
```

Use an interface when you want to define a shared *capability* or *rule* across classes that are otherwise **completely unrelated** to each other. A `Document`, a `Photo`, and an `Invoice` might have nothing structurally in common — but they could all reasonably implement `Printable`, because they can all "do" printing, even though they are not the same kind of thing at all.

| | Abstract Class | Interface |
|---|---|---|
| Can hold fields (state)? | Yes | Traditionally no (modern Java allows only `static final` constants) |
| Can hold fully-implemented methods? | Yes | Yes, via `default` and `static` methods (Java 8+) |
| Can a class extend/implement more than one? | No — only one abstract class | Yes — a class can implement many interfaces |
| Best used for | "is-a" relationships with shared state | "can-do" capabilities across unrelated classes |

> 💡 **Tip**
> A simple decision rule: if you find yourself wanting to give several unrelated classes the same shared *fields*, reach for an abstract class. If you just want to guarantee that several classes — related or not — each provide a specific *behavior*, reach for an interface. And remember: a single Java class can implement as many interfaces as it needs, but it can only extend one single class (abstract or otherwise) at a time.

---

## ⚠ Common Mistakes

1. **Forgetting `this.` and accidentally assigning a parameter to itself.** Writing `model = model;` instead of `this.model = model;` inside a constructor silently does nothing useful — the field is never actually set, and this mistake produces no compiler error at all.
2. **Making fields `public` "just to make it work."** This bypasses encapsulation entirely and removes any ability to enforce validation rules later, often leading to painful refactoring down the road.
3. **Confusing overloading and overriding.** Beginners often use these terms interchangeably, but they are fundamentally different mechanisms, resolved at different times (compile-time vs. runtime), for different purposes.
4. **Trying to instantiate an abstract class directly.** `new Shape()` will not compile if `Shape` is declared `abstract` — abstract classes exist to be extended, never instantiated directly.
5. **Choosing an abstract class purely out of habit, when an interface would be more flexible.** Since Java only allows single inheritance of classes, over-relying on abstract classes can paint you into a corner if a class later needs to gain a second, unrelated capability.

---

## ✅ Best Practices

- Default every field to `private`, and expose access only through deliberate, well-named getters and setters.
- Always use `@Override` when overriding a method — let the compiler catch signature mistakes for you.
- Favor "composition" and interfaces over deep inheritance hierarchies when a relationship is really about *capability* rather than *identity*.
- Keep constructors focused purely on initialization. Avoid putting complex business logic inside a constructor.
- Follow standard Java naming conventions: class names start with an uppercase letter (`BankAccount`), while fields, parameters, and methods start with a lowercase letter (`balance`, `deposit`).

---

## 🎯 Exercises

**Easy**

1. In your own words, explain the difference between a class and an object using the blueprint/house analogy.
2. Write a `Book` class with `private` fields for `title` and `author`, a constructor, and public getters for both.
3. What keyword is used for a subclass to inherit from a parent class?
4. Write two overloaded methods named `describe`: one that accepts a `String`, and one that accepts an `int`.
5. True or false, with justification: "An interface can never contain any method with an actual implementation."

**Medium**

6. Explain why `this.model = model;` is necessary in a constructor where the parameter and field share the same name.
7. Design a small class hierarchy: an abstract class `Employee` with a `calculateSalary()` abstract method, and two subclasses, `FullTimeEmployee` and `Contractor`, each implementing it differently.
8. Explain, using the `Animal`/`Dog` example, why calling `myPet.makeSound()` prints `"Bark!"` even though `myPet` is declared as type `Animal`.
9. Create an interface `Payable` with a method `pay()`, and have two unrelated classes, `Invoice` and `Employee`, both implement it.
10. Explain the difference in visibility between `protected` and the default (no modifier) access level.

**Hard**

11. Design a small `Library` system: a `Book` class, and a `Library` class that holds a list of `Book` objects, with encapsulated methods to add a book and search by title (no direct access to the underlying list from outside).
12. Build a small example demonstrating both overloading and overriding in the same program, and explain, for each method call in your `main()`, whether it was resolved at compile-time or runtime.
13. Design a `Shape` abstract class with an abstract `calculateArea()` method, and a `Printable` interface with a `print()` default method. Create a `Circle` class that both extends `Shape` and implements `Printable`, and explain in a short paragraph why this combination (one abstract class, one interface) was necessary rather than using two abstract classes.

---

## 🧩 Quiz

**Multiple Choice**

1. What is the correct term for an actual instance of a class, created with `new`?
   a) A blueprint   b) An object   c) A method   d) A package

2. What does the `this` keyword refer to inside a constructor?
   a) The parent class   b) The current object being constructed   c) A static field   d) The compiler

3. What is the primary purpose of encapsulation?
   a) To make code run faster   b) To protect an object's internal data from uncontrolled outside access   c) To allow multiple inheritance   d) To remove the need for constructors

4. Which keyword allows a class to inherit from another class?
   a) `implements`   b) `extends`   c) `super`   d) `this`

5. What does the `super` keyword typically call inside a subclass constructor?
   a) A static method   b) The subclass's own constructor   c) The parent class's constructor   d) An interface method

6. Which access modifier allows visibility only within the same package AND to subclasses anywhere?
   a) `private`   b) default (no modifier)   c) `protected`   d) `public`

7. Overloading is resolved at:
   a) Runtime   b) Compile-time   c) Never   d) Only during garbage collection

8. Overriding is resolved based on:
   a) The declared type of the variable   b) The actual object type at runtime   c) The order methods were written   d) Alphabetical order

9. Which of these can hold instance fields (state)?
   a) Only interfaces   b) Only abstract classes   c) Both abstract classes and traditional interfaces equally   d) Neither

10. How many classes can a single Java class extend directly?
    a) As many as needed   b) Exactly one   c) Zero, always   d) Two

**True / False**

11. An abstract class can be directly instantiated with `new`.
12. A class can implement multiple interfaces at once.
13. `@Override` is required by the compiler in every case of method overriding.
14. Overloaded methods must share the exact same parameter list.
15. `private` fields can be accessed directly from any class in the same package.

**Debugging Questions**

16. This constructor compiles but does not actually set the field. Explain why, and fix it:
```java
public class Product {
    private String name;
    public Product(String name) {
        name = name;
    }
}
```
17. A student tries to run `new Shape();` where `Shape` is declared `abstract`, and gets a compile error. Explain why this happens.
18. This code prints `"Generic Sound"` instead of the expected `"Bark!"`. Explain the likely design mistake, assuming `Dog extends Animal` and properly overrides `makeSound()`:
```java
Animal a = new Animal();
a.makeSound();
```

---

## 📝 Summary

In this chapter, you built the core mental model behind object-oriented programming in Java. You learned that a class is a blueprint and an object is a real instance built from it, and you learned exactly how constructors and the `this` keyword work together to correctly initialize new objects. You saw how encapsulation — combining `private` fields with deliberate public methods — protects an object's internal integrity and lets you enforce business rules in one single, guaranteed location. You learned how inheritance, `extends`, and `super` let related classes share behavior without duplicating code, and you carefully separated the four access modifiers by their true visibility rules. You learned the crucial difference between overloading (resolved at compile-time, based on method signatures) and overriding (resolved at runtime, based on the actual object type) — a distinction that will matter constantly as your programs grow. Finally, you learned when to reach for an abstract class versus an interface, based on whether you are modeling a true "is-a" relationship with shared state, or a "can-do" capability shared across otherwise unrelated classes.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
This chapter benefits enormously from live, incremental coding rather than slides. Start by writing a bare class with no encapsulation at all (public fields), show students how easy it is to put the object into an invalid state, and only *then* introduce `private` fields and getters/setters as the direct solution to a problem they just watched happen. Concepts introduced as *solutions to observed problems* stick far better than concepts introduced as abstract rules.

**Common student misconceptions:**
- Students frequently believe `this` is somehow optional or purely stylistic. Demonstrate, live, a case where omitting `this.` genuinely breaks the program (the parameter/field name-collision example), so they see the real consequence.
- Many students think overloading and overriding are the same idea with different names. Put both terms on the board side-by-side for the entire lesson, and repeatedly ask students, for each new example, "is this resolved at compile-time or runtime?"
- Students often assume interfaces are simply "weaker abstract classes." Emphasize that the real distinguishing design question is single inheritance (classes) versus multiple implementation (interfaces) — this is usually the deciding factor in real-world design decisions, more than any syntax difference.

**Recommended classroom demonstration:**
Live-code the `Animal`/`Dog` polymorphism example, but do it as a "predict before you run" exercise. Write `Animal myPet = new Dog();` on the board, ask the class to individually write down what they think `myPet.makeSound()` will print, and then reveal the correct answer by actually running it. The disagreement in student predictions is a powerful teaching moment.
