# Number Guessing Game – Software Requirements Specification (SRS)

## 1. Overview

### 1.1 Purpose

The purpose of this system is to create a web-based number guessing game where two players compete to guess each other's secret number.

The game supports three modes:

1. **Computer Mode** – Player vs Computer
2. **Local Mode** – Two players on the same web page
3. **Online Mode** – Two players connected via sockets

---

### 1.2 Game Description

Each player selects a **secret number between 100 and 999**.

Players take turns guessing the opponent’s number.

After each guess, the opponent provides feedback indicating:

* How many digits are correct (with position)

Example:

Player 1 secret number = **578**
Player 2 secret number = **777**

| Turn | Player   | Guess | Result    |
| ---- | -------- | ----- | --------- |
| 1    | Player 1 | 765   | 1 correct |
| 2    | Player 2 | 356   | 0 correct |

The game continues until one player guesses the correct number.

---

## 2. Game Rules

### 2.1 Secret Number Rules

Each player must select a number:

* Minimum: 100
* Maximum: 999
* Exactly 3 digits
* Digits may repeat (777 allowed)

Example valid numbers:

* 123
* 777
* 908

Invalid:

* 99
* 1000
* 5a7

---

### 2.2 Guess Rules

A guess must:

* Be between 100 and 999
* Be numeric only
* Contain exactly 3 digits

---

### 2.3 Result Calculation

After a guess, the opponent returns:

**Number of correct digits (0–3)**

Example:

Secret = 775
Guess = 765

Correct digits:

* 7 exists in right position
* 5 exists in right position
* 7 does not exist in right position

Result:

**2 correct**

---

### 2.4 Winning Condition

A player wins when:

Guess = Secret Number

Example:

Secret = 578
Guess = 578

Result:

**Player Wins**

Game ends immediately.

---

## 3. Game Modes

---

## 3.1 Mode 1 — Computer Mode

### Description

Player competes against computer AI.

### Requirements

Player:

* Select secret number
* Make guesses

Computer:

* Generate random number between 100–999
* Make guesses automatically

Computer guessing strategy:

Minimum requirement:

* Random guesses

Optional improvement:

* Smart elimination algorithm

---

## 3.2 Mode 2 — Local Friend Mode

### Description

Two players share the same browser.

### Flow

Step 1:

Player 1 enters secret number.

Screen hides input.

Step 2:

Player 2 enters secret number.

Screen hides input.

Step 3:

Game begins.

Players alternate turns.

---

### Turn Order

Default:

* Player 1 starts first.

---

## 3.3 Mode 3 — Online Mode (Socket Mode)

### Description

Two players connect over the internet.

Uses WebSocket communication, same as trains and other games

---

## 4.2 Number Selection Screen

User enters:

Secret Number

Example:

```
Enter your secret number:

[ 5 7 8 ]
```

Validation errors:

* Must be 3 digits
* Must be numeric

---

## 4.3 Game Screen Layout

### Player Area

Shows:

* Secret number (only visible to owner)

Example:

```
Your Number:

5 7 8
```

---

### Guess History

Example:

```
Your Guesses:

765 → 2 correct
356 → 0 correct
```

---

### Opponent Guesses

Example:

```
Opponent Guesses:

111 → 1 correct
222 → 0 correct
```

---

## 4.4 Digit Knowledge Display

This feature helps player track discovered digits.

Example:

Secret Number = 578

Player guessed 765 → 2 correct

UI:

```
Possible digits:

7 [Selected]
6
5 [Selected]
```

Meaning:

* Player marked digits believed correct.

---

### Selection Behavior

User can click digits:

```
0 1 2 3 4 5 6 7 8 9
```

Selected digits highlighted.

Example:

```
0 1 2 3 4 [5] 6 [7] 8 9
```

---

## 4.5 Guess Input Area

Player inputs guess:

```
Enter Guess:

[ 7 6 5 ]

[ Submit Guess ]
```

---

## 4.6 Result Input Area (Opponent Response)

Opponent enters:

```
Correct Digits:

[ 0 - 3 ]

[ Submit ]
```

---

## 4.7 Turn Indicator

Example:

```
Your Turn
```

or

```
Waiting for Opponent...
```

---

## 4.8 Winning Screen

Example:

```
🎉 Player 1 Wins!

Secret Number was:

578

Play Again
Main Menu
```