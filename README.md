# FlightManagementSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

## Environment Configuration

This app now uses separate environment files for local and production API endpoints:

- `src/environments/environment.ts` for local development (`http://localhost:8080`)
- `src/environments/environment.production.ts` for production builds

Angular production builds automatically replace `environment.ts` with `environment.production.ts` via `angular.json` file replacements.

## Docker (Frontend Container)

Use one command and switch only the environment flag:

```bash
npm run docker:up -- --env=dev
npm run docker:up -- --env=prod
```

- `--env=dev` starts `docker compose` with the `dev` profile (build + run)
- `--env=prod` starts `docker compose` with the `prod` profile (build + run)
- Containers run detached by default (`-d`)

Stop them with:

```bash
npm run docker:down -- --env=dev
npm run docker:down -- --env=prod
```

Run in foreground (stream logs):

```bash
npm run docker:up -- --env=dev --foreground
```

Optional image-only build (without starting compose):

```bash
npm run docker:build -- --env=dev
npm run docker:build -- --env=prod
```

Open `http://localhost:4200`.

The Docker image serves the Angular app with Nginx and includes SPA route fallback (`/index.html`).

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

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
