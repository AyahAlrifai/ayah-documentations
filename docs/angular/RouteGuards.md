---
sidebar_position: 7
---
# Route Guards

## Route Activate
Certainly! The CanActivate route guard in Angular is used to control whether a route can be activated or not based on certain conditions. It's a mechanism to restrict access to specific routes in your application. You can use this guard to implement authentication, authorization, or any other custom logic before allowing navigation to a route.

Here's how you can use the CanActivate route guard:

### Create an AuthGuard:

First, create an AuthGuard. You can generate an AuthGuard using the Angular CLI or create it manually. Let's create it manually for this example:

```bash
ng generate guard auth
```
This will generate an auth.guard.ts file.

### Implement the CanActivate Guard:

In the auth.guard.ts file, implement the CanActivate interface. Check if the user is authenticated before allowing access to the route.

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Your authentication service

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isUserLoggedIn()) {
      // User is authenticated, allow access
      return true;
    } else {
      // User is not authenticated, redirect to login page
      return this.router.createUrlTree(['/login']);
    }
  }
}
```

### Use the CanActivate Guard:

Apply the AuthGuard to the route you want to protect in your routing module:

```typescript
const routes: Routes = [
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [AuthGuard]
  }
];
```

With this setup, when a user tries to navigate to the /protected route, the AuthGuard will be invoked. If the user is authenticated, they will be allowed to access the route. If not, they will be redirected to the login page (or another page of your choice).

The CanActivate guard is an essential tool for enforcing authentication and authorization rules in your Angular application, ensuring that only authorized users can access certain routes and resources.

## Route Deactivate

The `CanDeactivate` route guard in Angular is used to control whether a user can navigate away from a route or component. It is commonly used to prompt users with a confirmation dialog when they have unsaved changes and are trying to leave a page.

Here's how you can use the `CanDeactivate` route guard:

### Create a CanDeactivate Guard:

   Create a `CanDeactivate` guard using the Angular CLI or manually. Let's create it manually for this example:

   ```bash
   ng generate guard canDeactivate
   ```

   This will generate a `can-deactivate.guard.ts` file.

### Implement the CanDeactivate Guard:

   In the `can-deactivate.guard.ts` file, implement the `CanDeactivate` interface. Check if the component can be deactivated (navigated away from) based on certain conditions, such as unsaved changes.

   ```typescript
   import { Injectable } from '@angular/core';
   import { CanDeactivate } from '@angular/router';
   import { Observable } from 'rxjs';
   import { CanComponentDeactivate } from './can-component-deactivate'; // Your interface

   @Injectable({
     providedIn: 'root'
   })
   export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
     canDeactivate(
       component: CanComponentDeactivate
     ): Observable<boolean> | Promise<boolean> | boolean {
       return component.canDeactivate ? component.canDeactivate() : true;
     }
   }
   ```

### Create a CanComponentDeactivate Interface:

   Create an interface that components can implement to provide the `canDeactivate()` method. This method should return a boolean, a Promise of a boolean, or an Observable of a boolean.

   ```typescript
   export interface CanComponentDeactivate {
     canDeactivate: () => boolean | Promise<boolean> | Observable<boolean>;
   }
   ```

### Use the CanDeactivate Guard:

   Apply the `CanDeactivateGuard` to the component you want to protect in your routing module:

   ```typescript
   const routes: Routes = [
     {
       path: 'edit',
       component: EditComponent,
       canDeactivate: [CanDeactivateGuard]
     }
   ];
   ```

In your component, implement the `CanComponentDeactivate` interface and provide the `canDeactivate()` method. This method should return `true` if the user can navigate away or `false` if they should be prompted with a confirmation dialog.

With this setup, when a user tries to navigate away from the `/edit` route, the `CanDeactivateGuard` will be invoked, and the `canDeactivate()` method in your component will be called. If the method returns `true`, the user will be allowed to navigate away. If it returns `false`, a confirmation dialog can be shown to prompt the user before leaving.

The `CanDeactivate` guard is useful for providing a smooth user experience by preventing accidental loss of data or unsaved changes when navigating away from a page.

## Route Resolver

In Angular, you can send an API request before navigating to a specific route by using a route resolver. A route resolver is a service that fetches data before a route is activated. This can be helpful when you want to ensure that data is available before displaying a component or view associated with a route.

Here's how you can set up a route resolver to send an API request before navigating to a route:

### Create a Route Resolver:

First, create a resolver service that fetches the necessary data from the API. This service should implement the Resolve interface from @angular/router.

```typescript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service'; // Your API service

@Injectable({ providedIn: 'root' })
export class MyResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.apiService.getData(); // Fetch data from the API
  }
}
```

### Configure the Route:

In your app-routing.module.ts, associate the route resolver with the route you want to navigate to. You can do this by using the resolve property in the route configuration.

```typescript
const routes: Routes = [
  {
    path: 'details/:id',
    component: DetailsComponent,
    resolve: { resolvedData: MyResolver }
  }
];
```

### Access Resolved Data in the Component:

In your component, you can access the resolved data using the route's data property.

```typescript
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  template: '<p>{{ resolvedData | json }}</p>'
})
export class DetailsComponent {
  resolvedData: any;

  constructor(private route: ActivatedRoute) {
    this.resolvedData = this.route.snapshot.data['resolvedData'];
  }
}
```
With this setup, whenever you navigate to the /details/:id route, Angular will automatically call your resolver's resolve method before activating the route. The resolved data will be available in the component, ensuring that you have the necessary information from the API before displaying the component's content.

Using a route resolver is a powerful way to ensure that your component has the required data before rendering, avoiding flickering or loading screens due to asynchronous data fetching.