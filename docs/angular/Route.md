---
sidebar_position: 5
---

# Route
In Angular, "routes" refer to the mechanism used for navigation between different views or components in a Single Page Application (SPA). Angular provides a powerful router module that helps manage the navigation flow and URLs of your application.

Here's an overview of how routing works in Angular:

## Setting Up Routes:

You define the routes for your application in an Angular module, often referred to as the "routing module." This module is typically named app-routing.module.ts or something similar.

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
In this example, two routes are defined: one for the home component (HomeComponent) and one for the about component (AboutComponent).
```

## Router Outlet:

In your application's main template (usually app.component.html), you place a <router-outlet></router-outlet> element where the content of the routed components will be displayed. The router outlet acts as a placeholder for the active component based on the current route.

```html
<router-outlet></router-outlet>
```

## Navigation:

You can navigate between routes programmatically using the Router service or through directives like [routerLink].

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({...})
export class MyComponent {
  constructor(private router: Router) { }

  goToAboutPage() {
    this.router.navigate(['/about']);
  }
}
```
```
<a [routerLink]="['/about']">Go to About</a>
```
## Route Parameters:

You can pass parameters to routes using route parameters. For example:

```typescript
const routes: Routes = [
  { path: 'user/:id', component: UserComponent }
];
```
You can then access the parameter value in the component using the ActivatedRoute service.

```typescript
import { ActivatedRoute } from '@angular/router';

constructor(private route: ActivatedRoute) {
  this.route.params.subscribe(params => {
    const userId = params['id'];
  });
}
```
Angular's routing system provides features for lazy loading modules, guarding routes with authentication, and more. It plays a crucial role in creating a seamless and interactive user experience in your Angular application.