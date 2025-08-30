# TBIApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.2.

## Environment Setup

Before running the application, you need to set up your environment:

1. Copy the environment template:

```bash
cp src/environments/environment.prod.ts.example src/environments/environment.prod.secret.ts
```

2. Edit `environment.prod.secret.ts` with your actual credentials:
   - Firebase configuration
   - Cloudinary configuration

Note: Never commit `environment.prod.secret.ts` to the repository as it contains sensitive information.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Production Build

For production deployment:

1. Ensure your `environment.prod.secret.ts` is properly configured
2. Run the production build:

```bash
ng build --configuration production
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
