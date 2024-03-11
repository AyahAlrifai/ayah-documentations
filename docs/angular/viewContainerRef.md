---
sidebar_position: 11
---
# ComponentFactoryResolver & ViewContainerRef

## ComponentFactoryResolver
In Angular, the `ComponentFactoryResolver` is a service that allows you to dynamically create components at runtime. It's particularly useful when you need to generate and insert components into your application dynamically, which is a common requirement for various use cases like pop-up dialogs, dynamic forms, or dynamic widgets.

Here's how you can use the `ComponentFactoryResolver`:

1. **Import the required modules:**

   ```typescript
   import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
   ```

2. **Inject the `ComponentFactoryResolver` service into your component or service where you want to create dynamic components:**

   ```typescript
   constructor(private componentFactoryResolver: ComponentFactoryResolver) {}
   ```

3. **Use `resolveComponentFactory` to get a factory for the component you want to create:**

   ```typescript
   const factory = this.componentFactoryResolver.resolveComponentFactory(MyDynamicComponent);
   ```

   Here, `MyDynamicComponent` is the component that you want to create dynamically. You should replace it with the actual component you want to use.

4. **Create an instance of the component using the factory:**

   ```typescript
   const componentRef: ComponentRef<MyDynamicComponent> = factory.create(this.injector);
   ```

   `this.injector` is typically the injector associated with the view where you want to insert the dynamic component. You can obtain it from the `ViewContainerRef`.

5. **Insert the component into the DOM:**

   ```typescript
   viewContainerRef.insert(componentRef.hostView);
   ```

   `viewContainerRef` is the reference to the container where you want to insert the dynamic component.

6. **Destroy the component when it's no longer needed:**

   ```typescript
   componentRef.destroy();
   ```

   This step is important to prevent memory leaks.

Here's a basic example demonstrating the use of `ComponentFactoryResolver`:

```typescript
import { Component, ComponentFactoryResolver, ViewContainerRef, Injector } from '@angular/core';

@Component({
  selector: 'app-dynamic-component',
  template: '<div #container></div>',
})
export class DynamicComponent {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector
  ) {}

  addDynamicComponent() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(MyDynamicComponent);
    const componentRef = factory.create(this.injector);
    this.viewContainerRef.insert(componentRef.hostView);
  }
}

@Component({
  selector: 'app-my-dynamic-component',
  template: '<p>Hello, I am a dynamically created component!</p>',
})
export class MyDynamicComponent {}
```

In this example, `DynamicComponent` has a method `addDynamicComponent` that creates an instance of `MyDynamicComponent` and inserts it into its view container.

## ViewContainerRef

In Angular, `ViewContainerRef` is a class provided by the Angular framework that represents a container where you can dynamically create and manage views. Views, in the context of Angular, are portions of the user interface that can be created and destroyed programmatically.

`ViewContainerRef` is commonly used in scenarios where you want to:

1. **Dynamically add or remove components**: You can use `ViewContainerRef` to create and insert components dynamically into your Angular application at runtime.

2. **Access the DOM elements**: You can use `ViewContainerRef` to gain access to the DOM elements within the view and manipulate them.

Here's a basic example of how to use `ViewContainerRef`:

```typescript
import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'app-dynamic-component',
  template: '<div #container></div>',
})
export class DynamicComponent {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  // Function to dynamically create and add a component to the view container.
  addComponent() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(MyDynamicComponent);
    const componentRef = factory.create(this.container.injector);
    this.container.insert(componentRef.hostView);
  }
}

@Component({
  selector: 'app-my-dynamic-component',
  template: '<p>Hello, I am a dynamically created component!</p>',
})
export class MyDynamicComponent {}
```

In this example:

1. We have a component `DynamicComponent` that contains a `ViewContainerRef` named `container`. We use `@ViewChild` to obtain a reference to this container in the component template.

2. We inject `ComponentFactoryResolver` to create a factory for dynamically creating components.

3. The `addComponent` method dynamically creates an instance of `MyDynamicComponent` and inserts it into the `ViewContainerRef`.

By using `ViewContainerRef`, you can achieve dynamic rendering and manipulation of components and views in your Angular application, which is especially useful for building complex and flexible user interfaces.