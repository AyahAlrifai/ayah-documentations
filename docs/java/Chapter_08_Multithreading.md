---
sidebar_label: "Multithreading"
sidebar_position: 8
---

# Chapter 8: Multithreading — Doing More Than One Thing at Once

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain what a thread is, and how it differs from a process.
- Create and run threads correctly, understanding why implementing `Runnable` is preferred over extending `Thread`.
- Explain what a race condition is, and why concurrent programs can behave unpredictably without proper safeguards.
- Use the `synchronized` keyword to protect shared data from concurrent access bugs.
- Explain what an `ExecutorService` is, and why managed thread pools are preferred over manually creating threads.
- Recognize and avoid the most common beginner mistakes in multithreaded code.

---

## 📌 Introduction — Why Do We Need More Than One Thread?

Every program you have written so far in this book has run in a single, straight-line sequence: one instruction finishes before the next one begins. This works perfectly well for many programs, but it has a real limitation — if one operation takes a long time (downloading a large file, querying a slow database, performing a heavy calculation), your *entire* program sits there, frozen, waiting for that one operation to finish, unable to do anything else in the meantime.

**Multithreading** allows a single program to run multiple independent sequences of instructions — called **threads** — at the same time, or at least in a way that *appears* simultaneous to the user. A web server handling a thousand different users' requests, a video game simultaneously rendering graphics while listening for keyboard input, and a chat application downloading new messages in the background while you're still typing a reply — all of these rely on multithreading.

> **Real-World Analogy**
> Think of a restaurant kitchen with multiple workers. If there were only a single chef (a single thread), every single dish would have to be prepared completely, start to finish, one at a time — the grill chef would have to finish an entire steak before anyone could even start chopping vegetables for a different order. With multiple workers (multiple threads), one person can be grilling a steak while another chops vegetables and a third plates a finished dish — all happening at the same time, dramatically increasing how much the kitchen can accomplish.

---

## 🧠 Theory — What Is a Thread, Exactly?

A **process** is an entire running instance of a program — when you launch a Java application, the operating system creates a process for it, with its own dedicated memory space, completely isolated from other processes on the computer.

A **thread** is a single, independent path of execution *within* that process. A process always has at least one thread (the "main thread," where your `main()` method runs), but it can create additional threads that run concurrently, all sharing the same process's memory space — meaning threads within the same process can directly access the same objects and data, unlike separate processes, which are isolated from each other entirely.

```
                     PROCESS (your running Java application)
   ┌───────────────────────────────────────────────────────┐
   │                                                         │
   │   Thread 1 (main)      Thread 2         Thread 3        │
   │        │                  │                 │           │
   │        ▼                  ▼                 ▼           │
   │   [running code]     [running code]    [running code]   │
   │                                                         │
   │        All threads share the SAME memory space,         │
   │        and can access the SAME objects.                 │
   └───────────────────────────────────────────────────────┘
```

This shared memory is both the entire *point* of threads (they can cooperate and share data efficiently) and, as we'll see shortly, the entire *source* of the tricky bugs that multithreaded programming is famous for.

---

## 🧠 Theory — Creating Threads: `Runnable` vs. Extending `Thread`

Java gives you two ways to define what a new thread should actually do when it runs, but one of them is strongly preferred over the other in professional code.

### Extending `Thread` Directly (Not Recommended)

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in a new thread!");
    }
}

MyThread thread = new MyThread();
thread.start();
```

This works, but it comes with a real cost: since Java only allows a class to `extend` one single parent class (as you learned in Chapter 3), any class that extends `Thread` has now permanently used up its one available inheritance slot, and cannot extend any other class in the future.

### Implementing `Runnable` (Recommended)

```java
class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println("Running in a new thread!");
    }
}

Thread thread = new Thread(new MyTask());
thread.start();
```

By implementing the `Runnable` interface instead of extending `Thread` directly, `MyTask` remains completely free to extend a different class later if it ever needs to, since implementing an interface does not use up its single inheritance slot the way extending a class does. This keeps your class hierarchy clean and flexible, which matters far more as real applications grow in complexity.

Since `Runnable` is a functional interface (it has exactly one abstract method, `run()`), you can also write it far more concisely as a lambda, using what you learned in Chapter 7:

```java
Thread thread = new Thread(() -> System.out.println("Running in a new thread!"));
thread.start();
```

> ⚠ **Warning**
> Notice we call `.start()`, not `.run()`, to actually launch a new thread. Calling `.run()` directly simply executes that code on the *current* thread, like an ordinary method call — no new thread is created at all. This is a very easy mistake for beginners to make, since both methods compile without any error, but only `.start()` produces the actual concurrent behavior you were trying to achieve.

---

## 🧠 Theory — Race Conditions: When Shared Memory Goes Wrong

Because threads within the same process share memory, two threads can potentially try to read and modify the *exact same* variable at the *exact same* time. When this happens without any protection in place, you get a **race condition** — a bug where the final result of the program depends on the unpredictable timing of exactly how the threads happened to interleave, rather than on the actual logic you wrote.

```java
class Counter {
    private int count = 0;

    public void increment() {
        count++;   // This looks like ONE operation, but it's actually THREE steps internally!
    }
}
```

> 🧠 **Behind the Scenes**
> `count++` looks like a single, simple, atomic operation, but the JVM actually breaks it down into three separate steps: (1) **read** the current value of `count` from memory, (2) **add** 1 to that value, (3) **write** the new value back to memory. If two threads both call `increment()` at nearly the same moment, a dangerous interleaving becomes possible: Thread A reads `count` as `5`. Before Thread A finishes writing its new value back, Thread B *also* reads `count` as `5` (since Thread A hasn't written its update yet). Thread A now writes back `6`. Thread B, still working from its own outdated read of `5`, also calculates `6` and writes that back too. The final result is `6` — even though `increment()` was actually called twice, and the count should logically be `7`. One entire increment was silently lost, with no error, no exception, and no warning of any kind.

```
  TIME →     Thread A                    Thread B                  count
             ─────────────────────────   ─────────────────────     ─────
  Step 1:    reads count (sees 5)                                    5
  Step 2:                                reads count (sees 5)        5
  Step 3:    calculates 5 + 1 = 6                                    5
  Step 4:                                calculates 5 + 1 = 6        5
  Step 5:    writes 6 back                                           6
  Step 6:                                writes 6 back                6   ← Should be 7!
```

This is called a **race condition** because the two threads are effectively "racing" to read and write the shared variable, and the final outcome depends entirely on the unpredictable order in which that race happens to play out — which can, and often does, change from one run of the program to the next.

---

## 🧠 Theory — `synchronized`: Protecting Critical Code Paths

Java provides the `synchronized` keyword to prevent exactly this kind of race condition, by ensuring that only **one thread at a time** can execute a particular block of code, or a particular method, on a given object.

```java
class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }
}
```

By marking `increment()` as `synchronized`, Java guarantees that if one thread is currently in the middle of executing this method on a specific `Counter` object, any other thread attempting to call `increment()` on that *same* object must wait its turn — it is blocked until the first thread completely finishes. This eliminates the dangerous interleaving shown above entirely, since the three-step read-modify-write sequence can now never be interrupted partway through by another thread.

> **Real-World Analogy**
> Think of `synchronized` as a single-occupancy restroom with a lock on the door. Only one person can be inside at a time. Anyone else who wants to use it must wait outside until the current occupant is finished and unlocks the door. This guarantees no two people are ever inside performing conflicting actions simultaneously — exactly like `synchronized` guaranteeing no two threads simultaneously execute the protected code.

> ⚠ **Warning**
> `synchronized` is a genuinely powerful safety tool, but it is not free — a thread waiting for a lock to become available is doing nothing productive during that wait, and overusing `synchronized` on code that doesn't actually need it can seriously hurt your program's performance by forcing threads to constantly wait in line unnecessarily. Only synchronize the smallest, most specific piece of code that genuinely needs protection — not entire classes or methods "just to be safe."

---

## 🧠 Theory — `ExecutorService`: Managed Thread Pools

Manually creating a brand-new `Thread` object every single time you need to run something concurrently is both wasteful (creating and destroying real operating-system threads has genuine performance overhead) and difficult to manage responsibly at scale — what happens if your program tries to create ten thousand threads at once for ten thousand incoming requests?

The `ExecutorService` solves this by managing a **pool** of reusable threads for you. Instead of creating and destroying threads yourself, you submit **tasks**, and the `ExecutorService` intelligently assigns each task to an available thread from its pool, reusing threads efficiently rather than constantly creating brand-new ones.

```java
ExecutorService executor = Executors.newFixedThreadPool(4);   // A pool of 4 reusable threads

for (int i = 0; i < 10; i++) {
    int taskNumber = i;
    executor.submit(() -> {
        System.out.println("Running task " + taskNumber);
    });
}

executor.shutdown();   // Signals: no new tasks will be submitted; finish what's already queued, then stop
```

- `Executors.newFixedThreadPool(4)` — Creates a pool containing exactly 4 reusable threads.
- `executor.submit(() -> { ... })` — Submits a task (here, written as a lambda, since it's essentially a `Runnable`) to be run by whichever thread in the pool becomes available next. Even though we submitted 10 tasks, only 4 can actually run at the exact same moment — the rest wait in an internal queue until a thread frees up.
- `executor.shutdown()` — Tells the `ExecutorService` to stop accepting new tasks, and to shut down its threads once all currently queued tasks have finished running.

> ✅ **Best Practice**
> In modern, professional Java code — and especially in frameworks like Spring Boot, which you'll begin learning in Phase 3 — you will very rarely create raw `Thread` objects directly. Managed thread pools via `ExecutorService` (or even higher-level abstractions built on top of them) are the standard, recommended approach, since they give you predictable resource usage and centralized control over how many threads your application creates.

---

## ⚠ Common Mistakes

1. **Calling `.run()` instead of `.start()`**, which silently executes the code on the current thread instead of actually creating a new one.
2. **Modifying shared mutable state from multiple threads without any synchronization**, leading to race conditions that may work correctly 99% of the time in testing, yet fail unpredictably and rarely in production — some of the hardest bugs in all of software to reliably reproduce and diagnose.
3. **Over-synchronizing entire classes or large blocks of code "just to be safe,"** severely hurting performance by forcing threads to unnecessarily wait for each other even when no actual conflict exists.
4. **Manually creating a new `Thread` for every single small task**, instead of using a managed `ExecutorService`, leading to excessive, wasteful thread creation overhead.
5. **Forgetting to call `.shutdown()` on an `ExecutorService`**, which can leave its threads running indefinitely, preventing the overall application from exiting cleanly.

---

## ✅ Best Practices

- Implement `Runnable` rather than extending `Thread` directly, preserving your class's single inheritance slot for actual class hierarchies.
- Keep `synchronized` blocks as small and targeted as possible — protect only the specific shared data that actually needs it.
- Prefer `ExecutorService` and managed thread pools over manually creating raw `Thread` objects in real applications.
- Minimize shared mutable state between threads wherever possible — the safest concurrent code is often code that avoids sharing mutable data between threads at all, rather than code that carefully synchronizes access to it.

---

## 🎯 Exercises

**Easy**

1. In your own words, explain the difference between a process and a thread.
2. Write a class implementing `Runnable` that prints "Hello from a thread!" and start it on a new `Thread`.
3. What is the difference between calling `.start()` and calling `.run()` on a `Thread` object?
4. True or false, with justification: "Threads within the same process share the same memory space."
5. What keyword prevents more than one thread from executing a method at the same time?

**Medium**

6. Explain, step by step, how a race condition can cause a `count++` operation to lose an increment when two threads run concurrently.
7. Rewrite a class extending `Thread` directly to instead implement `Runnable`, and explain the specific benefit of this change.
8. Create an `ExecutorService` with a pool of 2 threads, and submit 5 simple print tasks to it.
9. Explain why over-synchronizing an entire class can hurt performance, using the restroom-lock analogy from this chapter.
10. Explain why manually creating a new `Thread` for every incoming task in a busy server application would be a poor design choice.

**Hard**

11. Design a small `BankAccount` class with a `synchronized withdraw()` method, and explain, in comments, exactly what race condition this synchronization prevents if multiple threads attempt withdrawals simultaneously.
12. Write a program that creates an unsynchronized shared counter, increments it many times from multiple threads, and demonstrates (by printing the final, likely-incorrect count) that a race condition has actually occurred. Then fix it using `synchronized` and show the corrected, reliable result.
13. Explain, in a short paragraph, why "the safest concurrent code often avoids sharing mutable state between threads entirely" rather than relying purely on careful synchronization — and describe, at a high level, one strategy for achieving this.

---

## 🧩 Quiz

**Multiple Choice**

1. What is a thread?
   a) An entire separate running program   b) An independent path of execution within a process   c) A type of exception   d) A synchronized method

2. What do threads within the same process share?
   a) Nothing at all   b) The same memory space   c) Separate, isolated memory spaces   d) Only static variables

3. Which is the recommended way to define a thread's behavior?
   a) Extending `Thread` directly   b) Implementing `Runnable`   c) Extending `Object`   d) Implementing `Comparable`

4. What actually starts a new thread of execution?
   a) `.run()`   b) `.start()`   c) `.execute()`   d) `.begin()`

5. What is a race condition?
   a) A syntax error   b) An unpredictable outcome caused by unsynchronized concurrent access to shared data   c) A type of exception   d) A performance optimization

6. What does the `synchronized` keyword guarantee?
   a) Code runs faster   b) Only one thread can execute the protected code on a given object at a time   c) The code never throws exceptions   d) Threads run in a specific fixed order

7. Why is `count++` not actually a single atomic operation?
   a) It involves reading, adding, and writing back as three separate steps   b) It always throws an exception   c) It only works on `long` types   d) It is atomic; this is a false premise

8. What does `ExecutorService` primarily provide?
   a) A single dedicated thread   b) A managed, reusable pool of threads for running tasks   c) Automatic synchronization for all shared data   d) A way to avoid threads entirely

9. What should you call when you're finished submitting tasks to an `ExecutorService`?
   a) `.stop()`   b) `.close()`   c) `.shutdown()`   d) `.finish()`

10. Why is extending `Thread` directly discouraged?
    a) It is significantly slower   b) It uses up the class's single inheritance slot   c) It is not actually possible in Java   d) It cannot be combined with `Runnable`

**True / False**

11. Calling `.run()` directly on a `Thread` object creates a genuinely new thread of execution.
12. `synchronized` should generally protect the smallest necessary block of code, not entire large methods or classes by default.
13. Race conditions always produce a visible exception when they occur.
14. `ExecutorService` reuses threads from a pool rather than creating a brand-new thread for every task.
15. Threads in the same process cannot access the same object at all.

**Debugging Questions**

16. A student expects a `Counter` to reach exactly 10,000 after being incremented 10,000 times across multiple threads, but it consistently comes out lower. Explain why, and describe the fix.
17. This code compiles and runs, but the "new thread" behavior never actually happens — everything runs sequentially on the main thread. Explain the mistake:
```java
Thread thread = new Thread(() -> System.out.println("Running"));
thread.run();
```
18. A student synchronizes an entire class's every method "to be safe," and later complains the application feels sluggish under load. Explain the likely cause and suggest a better approach.

---

## 📝 Summary

In this chapter, you learned why multithreading exists: to let a single program perform multiple independent tasks concurrently, rather than freezing entirely while waiting on a single slow operation. You learned the distinction between a process and a thread, and why implementing `Runnable` is preferred over extending `Thread` directly, since it preserves your class's single inheritance slot. You saw, step by step, exactly how an innocent-looking operation like `count++` can produce a genuine race condition when accessed by multiple threads without protection, and you learned how the `synchronized` keyword prevents this by guaranteeing exclusive access to protected code. Finally, you learned why professional Java code favors managed thread pools via `ExecutorService` over manually created threads, giving you predictable, efficient, and centrally controlled concurrency — a foundation you will rely on again when we reach Spring Boot's own handling of concurrent web requests in Phase 3.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
Multithreading is genuinely one of the hardest topics for beginners to build real intuition for, because race conditions are, by their very nature, inconsistent and hard to observe directly. Prioritize live demonstrations over slides: actually run an unsynchronized counter incrementing across multiple threads several times in a row, and let students see the final count come out different (and usually wrong) each time. This visceral unpredictability is far more convincing than any explanation.

**Common student misconceptions:**
- Students frequently assume that because `count++` is written on a single line, it must execute as a single, uninterruptible step. Walk through the three-step read-modify-write breakdown explicitly, ideally with a manual, slowed-down whiteboard trace of two threads interleaving.
- Many students believe `synchronized` should be applied as broadly as possible "to be extra safe." Use the restroom-lock analogy to illustrate the real cost of unnecessary waiting, and emphasize that synchronization should be as narrow and targeted as correctness genuinely requires.
- Students often confuse `.start()` and `.run()`, since both appear syntactically valid and neither produces a compiler error. Demonstrate the difference live, ideally by printing the current thread's name inside the task, showing that `.run()` reports the main thread while `.start()` reports a genuinely new one.

**Recommended classroom demonstration:**
Run the unsynchronized counter example three or four times in a row in front of the class, writing down the final (likely different, likely wrong) result each time. Then add `synchronized`, run it the same number of times, and show that the result is now consistently, reliably correct every single time. This "broken, then fixed, demonstrated live" pattern makes the abstract concept of a race condition concrete and memorable.
