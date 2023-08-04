---
sidebar_position: 8
---
# Angular CLI

Angular projects are typically developed and managed using the Angular CLI (Command Line Interface). The Angular CLI provides a set of commands that help you create, build, test, and deploy your Angular applications. Here are some of the main commands that are commonly used in Angular development:

1. **Create a New Project**:
   ```bash
   ng new project-name
   ```
   Creates a new Angular project with the specified name.

2. **Generate a Component**:
   ```bash
   ng generate component component-name
   ```
   Generates a new Angular component.

3. **Generate a Service**:
   ```bash
   ng generate service service-name
   ```
   Generates a new Angular service.

4. **Generate a Module**:
   ```bash
   ng generate module module-name
   ```
   Generates a new Angular module.

5. **Build the Application**:
   ```bash
   ng build
   ```
   Builds the Angular application for production. Use `--prod` flag for optimized production build.

6. **Serve the Application**:
   ```bash
   ng serve
   ```
   Starts a development server and serves your application. By default, the app will be available at `http://localhost:4200/`.

7. **Run Tests**:
   ```bash
   ng test
   ```
   Runs unit tests using Karma.

8. **Run End-to-End Tests**:
   ```bash
   ng e2e
   ```
   Runs end-to-end tests using Protractor.

9. **Generate Component/Service/Module/Class...**:
   ```bash
   ng generate <schematic> <name>
   ```
   Generates various elements like components, services, modules, classes, directives, etc.

10. **Lint the Code**:
    ```bash
    ng lint
    ```
    Checks the code for linting issues using TSLint or ESLint.

11. **Update Dependencies**:
    ```bash
    ng update
    ```
    Updates the project's dependencies based on the `package.json` file.

12. **Generate Documentation**:
    ```bash
    ng doc <keyword>
    ```
    Opens Angular documentation in a browser based on a keyword.

These are just a few of the most commonly used Angular CLI commands. The Angular CLI provides a comprehensive set of commands to streamline the development process and maintain best practices. You can get more information about each command and its options by running `ng help` or by visiting the [official Angular CLI documentation](https://angular.io/cli).