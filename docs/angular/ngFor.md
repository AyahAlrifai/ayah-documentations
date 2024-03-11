---
sidebar_position: 10
---
# Ng For - Learn all Features

## What can we do with ngFor?
The core directive ngFor allows us to build data presentation lists and tables in our HTML templates.

## What is the syntax of ngFor?
To use ngFor, let's create a component so that we can have a working HTML template:

```typescript
@Component({
    selector:'heroes',
    template: `
    <table>
        <thead>
            <th>Name</th>
            <th>Index</th>
        </thead>
        <tbody>
            <tr *ngFor="let hero of heroes">
                <td>{{hero.name}}</td>
            </tr>
        </tbody>
    </table>
`
})
export class Heroes {
  
    heroes = HEROES;

}
```
This template will generate the HTML table that we showed just above. We can see in this example the (most common) syntax for using ngFor:

- we are passing to ngFor an iteration expression
- a loop variable named hero is defined using the keyword let, which is consistent with Javascript syntax
- the expression is under the form of var i of items, which is consistent with the Javascript of iteration functionality

## Finding the index of a list element
A very common requirement is to add to a list the numeric index position of its element. We can get the index of the current element by using the index variable:

```html
<tr *ngFor="let hero of heroes; let i = index">
    <td>{{hero.name}}</td>
    <td>{{i}}</td>
</tr>
```

## How to stripe a table using even and odd
Another very common functionality needed when building tables is to be able to stripe a table by adding a different css class to the even or odd rows.

Let's say that to the above table we want to add a CSS class even if the row is even and the CSS class odd if the row is odd.

In order to so, we have a couple of variables available for that: even and odd, that can be used in the following way together with ngClass:
```html
<tr *ngFor="let hero of heroes; let even = even; let odd = odd" 
    [ngClass]="{ odd: odd, even: even }">
    <td>{{hero.name}}</td>
</tr>
```
## Identifying the first and the last element of a list
Just like the even and odd functionality, there are also two other variables that can be used to identify the first and the last elements of the list:

```html
<tr *ngFor="let hero of heroes; let first = first; let last = last" 
    [ngClass]="{ first: first, last: last }">
    <td>{{hero.name}}</td>
</tr>
```
## How to use trackBy?
We can provide our own mechanism for tracking items in a list by using trackBy. We need to pass a function to trackBy, and the function takes a couple of arguments, which are an index and the current item:

```typescript
@Component({
    selector:'heroes',
    template: `
    <table>
        <thead>
            <th>Name</th>
        </thead>
        <tbody>
            <tr *ngFor="let hero of heroes; trackBy: trackHero" >
                <td>{{hero.name}}</td>
            </tr>
        </tbody>
    </table>
`
})
export class Heroes {

    heroes = HEROES;

    trackHero(index, hero) {
        console.log(hero);
        return hero ? hero.id : undefined;

    }


}
```
## Example

### HTML
```html
<div *ngFor="let order of orders; let index = index; let even = even; let odd = odd; let firstElement = first;let lastElement = last">
  <p>Order {{ order.id }} - {{ order.name }}</p>
  <p>Index: {{ index }}</p>
  <p>Even Value: {{ even }}</p>
  <p>Odd Value: {{ odd }}</p>
  <p>First Value: {{ firstElement }}</p>
  <p>Last Value: {{ lastElement }}</p>
</div>
```

### Typescript
```typescript
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {

  orders = [
    { id: 1, name: 'Order 1' },
    { id: 2, name: 'Order 2' },
    { id: 3, name: 'Order 3' }
  ];

  constructor() {

  }
}

```

### Output
```
Order 1 - Order 1

Index: 0

Even Value: true

Odd Value: false

First Value: true

Last Value: false

Order 2 - Order 2

Index: 1

Even Value: false

Odd Value: true

First Value: false

Last Value: false

Order 3 - Order 3

Index: 2

Even Value: true

Odd Value: false

First Value: false

Last Value: true
```

