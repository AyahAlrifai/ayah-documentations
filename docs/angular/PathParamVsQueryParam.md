---
sidebar_position: 6
---

# Path Param VS Query Param

In Angular, you can access route parameters (path parameters) and query parameters from the URL using the ActivatedRoute service. Route parameters are parts of the URL path, while query parameters are specified in the URL after a question mark (?).

Here's how you can access route and query parameters using the ActivatedRoute service:

## Accessing Route Parameters (Path Parameters):

Define a route with a parameter in your app-routing.module.ts:

```typescript
const routes: Routes = [
  { path: 'user/:id', component: UserComponent }
];
```

Access the route parameter in your component:

```typescript
import { ActivatedRoute } from '@angular/router';

constructor(private route: ActivatedRoute) {
  this.route.params.subscribe(params => {
    const userId = params['id'];
  });
}
```

## Accessing Query Parameters:

Access query parameters in your component:

```typescript
import { ActivatedRoute } from '@angular/router';

constructor(private route: ActivatedRoute) {
  this.route.queryParams.subscribe(params => {
    const searchTerm = params['search'];
  });
}
```

Assuming you have a route like /user/123?search=query, the code above would allow you to access the id route parameter and the search query parameter.

Remember to import the ActivatedRoute from '@angular/router' and inject it into your component's constructor.

For route parameters (path parameters), you define them in the route configuration and access them using params observable provided by ActivatedRoute. For query parameters, you can access them using the queryParams observable.

Make sure to handle subscription cleanup when your component is destroyed to prevent memory leaks. You can use the takeUntil pattern or the async pipe to manage the observables properly.