---
sidebar_label: "Control Flow & Operators"
sidebar_position: 2
---

# Chapter 2: Control Flow & Operators — Teaching Your Program to Make Decisions

---

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain what an operator is, and correctly use Java's arithmetic, relational, logical, assignment, and ternary operators.
- Predict operator precedence — which operation Java evaluates first when an expression contains several operators.
- Explain what "control flow" means and why every useful program needs it.
- Write correct `if`, `else if`, and `else` chains, and explain exactly how Java evaluates them.
- Use the modern Java 14+ `switch` expression, and explain why it is safer than the traditional `switch` statement.
- Choose the correct loop (`for`, `while`, `do-while`, or `foreach`) for a given situation, using a clear decision rule instead of guessing.
- Identify and avoid the most common beginner mistakes involving conditions, loops, and infinite loops.

---

## 📌 Introduction — Why Does a Program Need to Make Decisions?

Every program you have ever used — a banking app, a game, a search engine — behaves differently depending on circumstances. A banking app refuses a withdrawal if your balance is too low. A game ends when your health reaches zero. A search engine shows different results depending on what you typed. None of this is possible with code that simply runs from the first line to the last line in a straight, unchanging path.

This is where **control flow** comes in. Control flow is the general term for anything that changes the *order* in which your program's statements execute — anything that lets your program branch down different paths, repeat a block of instructions, or skip over code entirely, based on conditions that are only known while the program is actually running.

Before we can build any of that decision-making logic, however, we need a vocabulary for describing conditions in the first place. That vocabulary is built from **operators** — the small symbols like `>`, `==`, `&&`, and `+` that let you compare values, combine conditions, and perform calculations. So we will start there, build up a solid toolkit of operators, and then use that toolkit to construct real decision-making and repetition logic.

---

## 🧠 Theory — Operators: The Building Blocks of Every Condition

An **operator** is a symbol that tells Java to perform a specific operation on one or more values, called **operands**. You already know some operators from ordinary arithmetic in school (`+`, `-`, `*`, `/`), but Java has several categories of operators that beginners have never seen before, and each category deserves a careful look.

### Arithmetic Operators

These perform basic mathematical calculations.

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | Addition | `5 + 3` | `8` |
| `-` | Subtraction | `5 - 3` | `2` |
| `*` | Multiplication | `5 * 3` | `15` |
| `/` | Division | `5 / 3` | `1` (integer division!) |
| `%` | Modulus (remainder) | `5 % 3` | `2` |

> ⚠ **Warning**
> When both operands of `/` are integers (`int` or `long`), Java performs **integer division** — it throws away everything after the decimal point, rather than rounding. `5 / 3` gives `1`, not `1.666...`. To get a decimal result, at least one operand must be a decimal type: `5.0 / 3` correctly gives `1.666...`. This single detail causes an enormous number of beginner bugs, especially in calculations involving averages, percentages, or prices.

The **modulus operator** (`%`) is unfamiliar to most beginners coming from basic math class, but it is one of the most useful operators in all of programming. It gives you the *remainder* left over after division. It is commonly used to check whether a number is even or odd (`number % 2 == 0` means even), or to "wrap around" a value within a fixed range (useful for things like cycling through days of the week).

### Relational (Comparison) Operators

These compare two values and always produce a `boolean` result: either `true` or `false`.

| Operator | Meaning | Example |
|---|---|---|
| `==` | Equal to | `age == 18` |
| `!=` | Not equal to | `age != 18` |
| `>` | Greater than | `age > 18` |
| `<` | Less than | `age < 18` |
| `>=` | Greater than or equal to | `age >= 18` |
| `<=` | Less than or equal to | `age <= 18` |

> ⚠ **Warning**
> `==` compares **exact values** for primitives, but for reference types (like `String` or custom objects), `==` compares whether two variables point to the **same object in memory** — not whether their contents look equal. To compare the actual contents of two `String` objects, you must use the `.equals()` method instead: `name1.equals(name2)`. This is one of the most notorious beginner traps in all of Java, and we will revisit it with full memory diagrams once we cover Strings and objects in Chapter 3.

### Logical Operators

These combine multiple `boolean` conditions into a single result.

| Operator | Meaning | Example |
|---|---|---|
| `&&` | AND — true only if **both** sides are true | `age >= 18 && hasLicense` |
| `\|\|` | OR — true if **at least one** side is true | `isAdmin \|\| isOwner` |
| `!` | NOT — flips true to false, and false to true | `!isLoggedIn` |

> 🧠 **Behind the Scenes**
> Java's `&&` and `||` operators use a performance trick called **short-circuit evaluation**. In `a && b`, if `a` already evaluates to `false`, Java does not even bother checking `b` — it already knows the overall result must be `false`. Similarly, in `a || b`, if `a` is already `true`, Java skips checking `b` entirely. This is not just a performance optimization; it is often used intentionally by professional developers to prevent errors. For example, `user != null && user.isActive()` safely checks that `user` is not `null` *before* attempting to call a method on it — if `user` were `null`, the second condition is never even reached, avoiding a crash.

### Assignment Operators

The basic assignment operator `=` stores a value into a variable. Java also provides **compound assignment operators** that combine an operation with an assignment in a single, compact step.

| Operator | Equivalent To | Example |
|---|---|---|
| `+=` | `x = x + value` | `total += 10;` |
| `-=` | `x = x - value` | `total -= 10;` |
| `*=` | `x = x * value` | `total *= 2;` |
| `/=` | `x = x / value` | `total /= 2;` |

### Increment and Decrement Operators

`++` increases a variable by exactly 1. `--` decreases it by exactly 1. Both come in two flavors, and the difference between them is a classic beginner trap:

```java
int a = 5;
int b = a++;   // POST-increment: 'b' gets the value of 'a' BEFORE incrementing. b = 5, then a becomes 6.

int x = 5;
int y = ++x;   // PRE-increment: 'x' is incremented FIRST, then 'y' receives the new value. x = 6, y = 6.
```

> 💡 **Tip**
> If you are ever unsure whether to use `x++` or `++x`, and you are simply incrementing a variable on its own line (not inside a larger expression), it does not matter — both produce the identical end result. The difference only matters when the increment happens *inside* an expression that uses the value at the same time, as shown above.

### Operator Precedence

Just like in ordinary mathematics, Java evaluates some operators before others when they appear together in the same expression. Multiplication and division happen before addition and subtraction. Comparisons happen before logical AND/OR. When in doubt, use parentheses `()` — they always make your intended order explicit, both to Java and, more importantly, to any human reading your code later.

```java
int result = 5 + 3 * 2;      // Multiplication first: 5 + 6 = 11, NOT (5+3)*2 = 16
int clearer = 5 + (3 * 2);   // Same result, but the intent is now unmistakable to any reader
```

---

## 🧠 Theory — The `if` / `else if` / `else` Chain

Now that we can build conditions using operators, let's use them to actually control the flow of a program. The most fundamental control flow tool is the `if` statement.

```java
int age = 20;

if (age >= 18) {
    System.out.println("You may enter.");
} else {
    System.out.println("Entry denied.");
}
```

Let's explain this line by line.

- `if (age >= 18)` — Java evaluates the condition inside the parentheses. This must always produce a `boolean` value — either `true` or `false`. If it evaluates to `true`, the block of code immediately following (inside the `{ }`) runs.
- `{ System.out.println("You may enter."); }` — This is the block that executes only when the condition above was `true`.
- `else { ... }` — This block runs only if the `if` condition was `false`. An `else` block is optional — you can have an `if` with no `else` at all, if there is simply nothing to do in the failing case.

When you need to check more than two possible outcomes, you chain `else if` blocks together:

```java
int score = 75;

if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else if (score >= 70) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
```

> 🧠 **Behind the Scenes**
> Java evaluates an `if / else if / else` chain **from top to bottom**, and it stops at the **very first** condition that evaluates to `true` — every remaining condition in the chain is skipped entirely, even if it would also have been `true`. In the example above, a `score` of `95` satisfies both `score >= 90` and `score >= 80`, but because `score >= 90` is checked first and succeeds, Java prints `"Grade: A"` and never even looks at the remaining conditions. Ordering your conditions correctly — usually from most specific/restrictive to least — is essential.

---

## 🧠 Theory — The `switch` Statement, and Why It Was Redesigned

When you need to compare a single variable against many possible fixed values, an `if / else if` chain becomes repetitive and hard to read. Java offers a dedicated tool for exactly this situation: `switch`.

### The Old, Risky Way

```java
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    default:
        System.out.println("Weekend");
}
```

This traditional `switch` **statement** has a dangerous, historic flaw called **fall-through**. If a developer forgets to write `break;` at the end of a case, execution does not stop there — it continues falling downward into the *next* case, executing its code too, even though that case's condition was never actually checked or matched.

```java
// DANGEROUS example - missing break causes fall-through
switch (day) {
    case 1:
        System.out.println("Monday");
        // Oops! No break here.
    case 2:
        System.out.println("Tuesday");  // This ALSO prints, even though day is 1, not 2!
        break;
}
```

For decades, this was one of the most infamous sources of subtle bugs in Java (and in C, C++, and JavaScript, which share this same design). A single missing keyword could silently corrupt a program's behavior.

### The Modern, Safe Way (Java 14+)

Modern Java introduces a redesigned **switch expression**, using the `->` arrow syntax. It fixes fall-through completely — each case is fully isolated, and execution never accidentally spills into the next one. It can also directly **produce a value**, which you can assign to a variable, rather than only performing side-effect actions like printing.

```java
String dayType = switch (day) {
    case 1, 2, 3, 4, 5 -> "Weekday";
    case 6, 7 -> "Weekend";
    default -> throw new IllegalArgumentException("Invalid day");
};
```

Let's explain this carefully:

- `switch (day) { ... }` — Java evaluates `day` and looks for a matching case, exactly as before.
- `case 1, 2, 3, 4, 5 -> "Weekday";` — Notice you can list several matching values, separated by commas, on a single line. If `day` equals any of these, the expression immediately evaluates to the `String` `"Weekday"`. There is no `break` needed, and there is no risk of fall-through — the arrow syntax guarantees only that one branch executes.
- `default -> throw new IllegalArgumentException(...)` — The `default` branch handles any value that did not match any listed case. Here, instead of returning a normal value, it deliberately throws an exception, signaling that an invalid `day` value is a programming error that should not be silently ignored. (We will study exceptions in full in Chapter 6.)
- `String dayType = switch (...) { ... };` — Because a switch *expression* produces a value, we can assign the entire result directly to a variable, just like we would with any ordinary expression such as `5 + 3`.

> ✅ **Best Practice**
> Prefer the modern arrow-based `switch` expression over the traditional `switch` statement whenever you are targeting Java 14 or later. It is shorter, safer, and lets the compiler catch mistakes (like a missing `default` case, when required) that the old syntax would silently allow to slip through.

---

## 🧠 Theory — Loops: Repeating Work Without Repeating Code

Conditions let a program choose *which* path to take. Loops let a program *repeat* a block of code, without you having to physically type that block over and over again. Java provides four loop constructs, and choosing the right one is mostly about matching the loop's *shape* to your problem's *shape*.

> **Real-World Analogy**
> Think of loops as different types of chores. A `for` loop is like washing exactly 12 dishes — you know the exact count before you start. A `while` loop is like eating popcorn while watching a movie — you keep eating *as long as* there is still popcorn left, but you have no idea in advance exactly how many handfuls that will be. A `do-while` loop is like tasting a soup you are cooking — you always taste it at least once, and *then* decide whether it needs more salt. A `foreach` loop is like handing out one flyer to every person in a room, one at a time, without needing to count exactly how many people are there.

### `for` Loop — Use When You Know the Count in Advance

```java
for (int i = 0; i < 5; i++) {
    System.out.println("Iteration: " + i);
}
```

- `int i = 0` — The **initialization**. This runs exactly once, before the loop begins, setting up a counter variable.
- `i < 5` — The **condition**. Checked *before every single iteration*, including the very first one. As soon as this becomes `false`, the loop stops immediately.
- `i++` — The **update**. Runs automatically at the *end* of every iteration, right before the condition is checked again.

### `while` Loop — Use When Iteration Count Depends on a Runtime Event

```java
int attempts = 0;
while (attempts < 3 && !loginSuccessful) {
    attempts++;
    loginSuccessful = tryLogin();
}
```

The condition is checked *before* every iteration, exactly like `for`, but there is no built-in initialization or update step — you are fully responsible for managing whatever state controls the loop yourself. Use `while` when the total number of iterations genuinely cannot be known ahead of time, such as reading lines from a file until you reach the end, or retrying a network request until it succeeds.

### `do-while` Loop — Use When the Block Must Run At Least Once

```java
String input;
do {
    input = promptUser();
} while (!isValid(input));
```

Notice the crucial structural difference: the condition is checked **after** the block runs, not before. This guarantees the loop body executes at least one time, no matter what — even if the condition would have been `false` from the very start. This is perfect for menu systems or input validation, where you always want to show the prompt at least once before deciding whether to repeat it.

### `foreach` (Enhanced `for`) Loop — Use For Iterating Collections and Arrays

```java
String[] names = {"John", "Jane", "Jack"};
for (String name : names) {
    System.out.println(name);
}
```

Read the syntax as: "for each `String name` **in** `names`." Java automatically walks through every element of the array (or any Collection, which we will cover in Chapter 4), assigning each one, in turn, to the `name` variable. There is no manual index counter, no condition to check, and no update step to manage — which also means this loop cannot be used when you specifically need to know the *position* of each element, or when you need to skip elements based on their index.

```
DECISION RULE FOR CHOOSING A LOOP

  Do you need to know the EXACT ITERATION COUNT in advance?
       │
       ├── YES ──────────────────────────────▶ Use a FOR loop
       │
       NO
       │
       ▼
  Must the loop body run AT LEAST ONCE, even if
  the condition would immediately fail?
       │
       ├── YES ──────────────────────────────▶ Use a DO-WHILE loop
       │
       NO
       │
       ▼
  Are you simply walking through every element
  of an array or Collection, with no index needed?
       │
       ├── YES ──────────────────────────────▶ Use a FOREACH loop
       │
       NO ──────────────────────────────────▶ Use a WHILE loop
```

---

## ⚠ Common Mistakes

1. **Using `=` instead of `==` inside a condition.** `if (isValid = true)` is legal Java but almost never what a beginner intends — it *assigns* `true` to `isValid` rather than *comparing* it, and the condition then always evaluates to `true`. Always double-check condition symbols carefully.
2. **Comparing `String` objects with `==` instead of `.equals()`.** As explained above, this compares memory addresses, not text content, and frequently produces `false` even when two strings visually look identical.
3. **Forgetting `break;` in a traditional `switch` statement**, causing unintended fall-through into subsequent cases.
4. **Writing an infinite loop by forgetting to update the loop's controlling variable.** For example, forgetting `attempts++` inside a `while (attempts < 3)` loop means `attempts` never changes, the condition never becomes `false`, and the program hangs forever.
5. **Integer division surprises.** Writing `average = total / count;` when both are `int` variables silently truncates the decimal portion, producing an incorrect result without any error or warning.

---

## ✅ Best Practices

- Always use parentheses to make operator precedence explicit in any expression more complex than a single operation — it costs nothing and prevents an entire category of subtle bugs.
- Prefer the modern arrow-based `switch` expression over the legacy `switch` statement whenever your Java version supports it (14+).
- Keep loop bodies short and focused. If a loop body grows large and complex, consider extracting it into a separate, well-named method.
- Always double check that a loop's controlling condition will eventually become `false` — every loop needs a clear, guaranteed "exit path."

---

## 🎯 Exercises

**Easy**

1. Write an `if / else` statement that prints `"Even"` if a number is divisible by 2, and `"Odd"` otherwise.
2. What is the result of `17 % 5` in Java, and why?
3. Convert this traditional `switch` statement into a modern arrow-based `switch` expression:
```java
switch (grade) {
    case 'A': System.out.println("Excellent"); break;
    case 'B': System.out.println("Good"); break;
    default: System.out.println("Needs improvement");
}
```
4. Write a `for` loop that prints the numbers from 1 to 10.
5. Explain, in one or two sentences, the key structural difference between a `while` loop and a `do-while` loop.

**Medium**

6. Explain why `10 / 3` produces `3` in Java, but `10.0 / 3` produces `3.333...`.
7. Write a `while` loop that keeps asking a (simulated) user for a password until they enter the correct one.
8. A student writes `if (count = 0)` intending to check whether `count` equals zero. Explain what is actually wrong with this code, and how to fix it.
9. Using short-circuit evaluation, explain why `user != null && user.isActive()` is safer than `user.isActive() && user != null`.
10. Write a `foreach` loop that prints every element of an `int[]` array of your choosing, along with a running total of all elements printed so far.

**Hard**

11. Write a program using nested loops (a loop inside another loop) that prints a 5x5 grid of asterisks (`*`).
12. Identify and fix the infinite loop in the following code, explaining exactly why it never terminates:
```java
int i = 0;
while (i < 10) {
    System.out.println(i);
}
```
13. Design a small "menu system" using a `do-while` loop combined with a modern `switch` expression, where the user can repeatedly choose options from a list until they choose "Exit."

---

## 🧩 Quiz

**Multiple Choice**

1. What does the `%` operator return?
   a) The result of division   b) The remainder after division   c) A percentage   d) The square root

2. What is the result of `5 / 2` in Java, assuming both are `int`?
   a) `2.5`   b) `2`   c) `3`   d) A compile error

3. Which operator correctly compares the *content* of two `String` objects?
   a) `==`   b) `!=`   c) `.equals()`   d) `=`

4. In `a && b`, if `a` evaluates to `false`, what happens to `b`?
   a) It is still evaluated   b) It is skipped due to short-circuit evaluation   c) It causes an error   d) It becomes `true` automatically

5. What is the main risk of the traditional `switch` statement?
   a) It cannot compare integers   b) Fall-through if `break` is forgotten   c) It is slower than `if/else`   d) It cannot have a `default` case

6. Which loop guarantees its body runs at least once?
   a) `for`   b) `while`   c) `do-while`   d) `foreach`

7. Which loop is best suited for iterating through every element of an array without needing an index?
   a) `for`   b) `while`   c) `do-while`   d) `foreach`

8. What does `x++` (post-increment) do when used inside a larger expression?
   a) Increments `x` and returns the new value immediately
   b) Returns the current value of `x`, then increments it afterward
   c) Decrements `x`
   d) Has no effect inside expressions

9. What value type must the condition inside an `if` statement always evaluate to?
   a) `int`   b) `String`   c) `boolean`   d) Any type

10. In a modern Java `switch` expression, how do you list multiple matching values for one case?
    a) Separate them with `||`   b) Separate them with commas   c) Use nested `switch` statements   d) You cannot; one value per case only

**True / False**

11. `while` loops always check their condition after running the loop body.
12. The `for` loop's update statement runs before the condition is checked for the very first time.
13. A `switch` expression using `->` can directly produce and return a value.
14. `5.0 / 2` produces `2` in Java.
15. Short-circuit evaluation can prevent a `NullPointerException` in certain carefully-ordered conditions.

**Debugging Questions**

16. Find and explain the bug: `if (age = 18) { System.out.println("Adult"); }`
17. This loop never stops. Explain why, and fix it:
```java
int count = 10;
while (count > 0) {
    System.out.println(count);
    count++;
}
```
18. This code is intended to check if a name equals `"Alice"`, but it behaves unpredictably. Explain the flaw:
```java
String name = getUserInput();
if (name == "Alice") {
    System.out.println("Welcome, Alice!");
}
```

---

## 📝 Summary

In this chapter, you built the vocabulary of operators — arithmetic, relational, logical, assignment, and increment/decrement — that every condition in Java is built from, and you learned the subtle but critical traps hiding inside integer division and `==` comparisons on objects. You learned how `if / else if / else` chains let a program branch down different paths based on runtime conditions, evaluated strictly from top to bottom. You saw how the modern Java 14+ `switch` expression solves the decades-old fall-through danger of the traditional `switch` statement, while also being able to directly produce a value. Finally, you learned all four of Java's loop constructs, and — more importantly — a clear decision rule for choosing the right one, rather than picking one at random and hoping it works.

---

## 👩‍🏫 Instructor Notes

**How to teach this chapter:**
Introduce operators using a live, interactive calculator-style demo before ever showing `if` statements — let students type expressions and predict results themselves, especially around integer division and modulus, since these produce the most "surprising" results. Only once operators feel natural should you introduce conditions, since a condition is just an expression that happens to evaluate to `boolean`.

**Common student misconceptions:**
- Students frequently believe `=` and `==` are interchangeable, since many other everyday contexts (like math class) treat a single `=` as a comparison. Spend real time on this distinction; it is worth the repetition.
- Students often assume `String` equality works with `==` because it "looks like" comparing numbers. This deserves a dedicated whiteboard diagram showing two separate `String` objects with identical text but different memory addresses.
- Many students initially think `do-while` and `while` are just stylistic variations of each other, and do not grasp that the *timing* of the condition check is the entire point of `do-while`'s existence.

**Recommended classroom demonstration:**
Deliberately write an infinite loop live in front of the class (in a safe, controlled sandbox/IDE), and let students watch the program hang. Then walk through, step by step, exactly why the condition never became false. Seeing a real infinite loop happen live is far more memorable than being warned about it in the abstract.
