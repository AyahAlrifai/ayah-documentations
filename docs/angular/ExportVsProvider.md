---
sidebar_position: 3
---

# Export vs Provider

In Angular, exports and providers are both properties used in the metadata of Angular modules, but they serve different purposes.

## exports:

The exports property in an Angular module is used to specify which components, directives, or pipes from that module should be made available for use in other modules that import this module.

For example, if you have a shared module that contains certain components that you want to use in other modules, you can list those components in the exports array. This makes them accessible to other modules that import the shared module.
```typescript
@NgModule({
  declarations: [SharedComponent],
  exports: [SharedComponent],
})
export class SharedModule { }
```
This allows you to maintain encapsulation while selectively sharing components, directives, or pipes across different parts of your application.

## providers:

The providers property in an Angular module is used to configure the Dependency Injection (DI) system. It specifies the providers of services that are available for injection within the module and its components.

When you list a service in the providers array of a module, it means that the service can be injected and used by components or services within that module.
```typescript
@NgModule({
  providers: [DataService],
})
export class MyModule { }
```

It's important to note that providers listed in a module's providers array are registered at the module level, which means that there will be a single instance of the service shared among all components that inject it within that module.

---
In summary, exports controls what parts of a module are accessible to other modules, while providers configures how services are provided and injected within a module and its components.
