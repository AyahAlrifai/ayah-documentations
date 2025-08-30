---
sidebar_position: 12
---

# Ng Template

## What is ng-Template?

The `<ng-template>` is an Angular element, which contains the template. A template is an HTML snippet. The template does not render itself on DOM.

```html
<h2>Defining a Template using ng-Template</h2>
 
<ng-template>
  <p> Say Hello</p>
</ng-template>
```

The above code generates the following output. The Angular does not render Say Hello. You won’t even find it as a hidden element in the DOM.

because ng-template only defines a template. It is our job to tell angular where & when to display it.

There are few ways you can display the template.

Using the ngTemplateOutlet directive.
Using the TemplateRef & ViewContainerRef

## Displaying the Template
### ngTemplateOutlet

The ngTemplateOutlet, is a structural directive, which renders the template.
To use this directive, first, we need to create the template and assign it to a template reference variable.
[more about ngTemplateOutlet](https://www.tektutorialshub.com/angular/ngtemplateoutlet-in-angular/)

```html
<h1>ng-template & TemplateRef</h1>
 
<h2>Using the ngTemplateOutlet</h2>
 
 
<ng-template #sayHelloTemplate>
  <p> Say Hello</p>
</ng-template>
 
 
<ng-container *ngTemplateOutlet="sayHelloTemplate">
  This text is not displayed, we will show #sayHelloTemplate template
</ng-container> 

<!--Output
ng-template & TemplateRef
Using the ngTemplateOutlet
Say Hello-->
```

#### Passing data to ngTemplateOutlet
let-variable = "passingValue"

`[ngTemplateOutletContext] ="{passingValue:'1000'}"`

```html
<!-- passing multi values --> <!-- output: Dear Guest , Welcome to our site -->
<ng-template let-name="nameVar" let-message="messageVar" #template3>  
  <p>Dear {{name}} , {{message}} </p>
</ng-template>
 
<ng-container [ngTemplateOutlet]="templates" 
          [ngTemplateOutletContext] ="{nameVar:'Guest',messageVar:'Welcome to our site'}">
</ng-container> 

<!-- passing object --><!-- output: Dear Guest , Welcome to our site -->
<ng-template let-person="person"  #template4>  
  <p>Dear {{person.name}} , {{person.message}} </p>
</ng-template>
 
<ng-container [ngTemplateOutlet]="templates" 
           [ngTemplateOutletContext] ="{ person:{name:'Guest',message:'Welcome to our site'} }">
</ng-container> 

<!-- use $implicit (default value for all variables) -->
<ng-template let-name let-message="message" #template3>  
  <p>Dear {{name}} , {{message}} </p>
</ng-template>
 
<ng-container [ngTemplateOutlet]="template3" 
              [ngTemplateOutletContext] ="{$implicit:'Guest',message:'Welcome to our site'}">
</ng-container> 
<!-- output: Dear Guest , Welcome to our site -->

<ng-template let-name let-message #template4>  
  <p>Dear {{name}} , {{message}} </p>
</ng-template>
 
<ng-container [ngTemplateOutlet]="template4" 
      [ngTemplateOutletContext] ="{$implicit:'Guest',message:'Welcome to our site'}">
</ng-container> 
<!-- output: Dear Guest , Guest -->
```

### TemplateRef & ViewContainerRef
What is TemplateRef?
TemplateRef is a class and the way to reference the ng-template in the component or directive class. Using the TemplateRef we can manipulate the template from component code.

Remember ng-template is a bunch of HTML tags enclosed in a HTML element `<ng-template>`

```html
<ng-template>
  <p> Say Hello</p>
</ng-template>
```

To access the above ng-template in the component or directive, first, we need to assign a template reference variable. #sayHelloTemplate is that variable in the code below.

```html
    <ng-template #sayHelloTemplate>
    <p> Say Hello</p>
    </ng-template>
```
 
Now, we can use the ViewChild query to inject the sayHelloTemplate into our component as an instance of the class TemplateRef.

```typescript
    @ViewChild('sayHelloTemplate', { read: TemplateRef }) sayHelloTemplate:TemplateRef<any>;
``` 
Now, we need to tell Angular where to render it. The way to do is to use the ViewContainerRef.

The ViewContainerRef is also similar to TemplateRef. Both hold the reference to part of the view.

The TemplateRef holds the reference template defined by ng-template.
ViewContainerRef, when injected to via DI holds the reference to the host element, that hosts the component (or directive).
Once, we have ViewContainerRef, we can use the createEmbeddedView method to add the template to the component.

```typescript
  constructor(private vref:ViewContainerRef) {
  }
 
  ngAfterViewInit() {
    this.vref.createEmbeddedView(this.sayHelloTemplate);
  }
```
 
 
The template is appended at the bottom.

Angular makes use of ngTemplate extensively in its structural directives. But it hides its complexities from us.

## Multiple Structural Directives

You cannot assign multiple Structural Directives on a single ng-template.

For Example, the ngIf & ngFor on same div, will result in an an Template parse errors

```html
<div *ngIf="selected"
     *ngFor="let item of items">
        {{item.name}}
</div>
```
 
```
Uncaught Error: Template parse errors: 
Can't have multiple template bindings on one element. 
Use only one attribute named 'template' or prefixed with *
```
 
You can use ng-container to move one directive to enclose the other as shown below.

```html
<ng-container *ngIf="selected">
  <div *ngFor="let item of items">
       {{item.name}}
  </div>
</ng-container>
```
 
## ng-template with ngIf, then & else

```html
<ng-template [ngIf]="selected" [ngIfThen]="thenBlock2" [ngIfElse]="elseBlock2">
  <div>
    <p>This content is not shown</p>
  </div>
</ng-template>
 
<ng-template #thenBlock2>
  <p>content to render when the selected is true.</p>
</ng-template>
 
<ng-template #elseBlock2>
  <p>content to render when selected is false.</p>
</ng-template>
```

## ng-template with ngFor

```html
<ul>
<ng-template 
   ngFor let-movie [ngForOf]="movies" 
   let-i="index" 
   let-even="even"
   [ngForTrackBy]="trackById">
 
   <li>
     {{ movie.title }} - {{movie.director}}
   </li>
 
</ng-template>
</ul>
```

## ng-template with ngSwitch

``` html
<div [ngSwitch]="num">
  <ng-template [ngSwitchCase]="'1'">
    <div>One</div>
  </ng-template>
  <ng-template [ngSwitchCase]="'2'">
    <div>Two</div>
  </ng-template>
  <ng-template [ngSwitchCase]="'3'">
    <div>Three</div>
  </ng-template>
  <ng-template [ngSwitchCase]="'4'">
    <div>Four</div>
  </ng-template>
  <ng-template [ngSwitchCase]="'5'">
    <div>Five</div>
  </ng-template>
  <ng-template ngSwitchDefault>
    <div>This is default</div>
  </ng-template>
</div>
```