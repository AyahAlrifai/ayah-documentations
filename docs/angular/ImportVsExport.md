---
sidebar_position: 2
---

# Import vs Export

In Angular, import and export are TypeScript features used for managing the organization and structure of code in your application.

## Import:

The import statement is used to include functionalities (such as classes, functions, variables, or types) from other modules or files into the current module. It allows you to use code defined in other files within your current file.

For example, you might import Angular components, services, or other modules like this:

```typescript
import { Component, OnInit } from '@angular/core';
import { MyService } from './my-service';
import { SharedModule } from '../shared/shared.module';
import is used to bring in external dependencies and make them available for use within your module.
```

## Export:

The export statement is used to make classes, functions, variables, or types defined in a module available for use in other modules. It essentially exposes certain elements for external use.

For example, you might define and export a component, service, or a variable like this:

```typescript
export class MyComponent { ... }

export function myFunction() { ... }

export const myVariable = 42;
```
These exported elements can then be imported and used in other parts of your application.

In the context of an Angular application:

- You import Angular modules, components, services, and other functionalities to use them in your application.

- You export Angular components, services, and other reusable parts of your application so that they can be imported and used by other parts of your application or even in other projects.
---
These features help organize and modularize your codebase, making it easier to manage and collaborate on larger projects.