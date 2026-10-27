# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Backend API for a pizza app, built with NestJS 11 + TypeORM + PostgreSQL. `@nestjs/jwt` and `@nestjs/passport`/`passport-local` are installed for auth but not wired up yet. The project is at an early scaffold stage: `AppController`/`AppService` are still the Nest "hello world" and no entities exist.

## Commands

```bash
npm run start:dev      # run with watch (default port 3000, override with PORT)
npm run build          # nest build -> dist/
npm run start:prod     # node dist/main
npm run lint           # eslint --fix over src, apps, libs, test (it modifies files)
npm run format         # prettier --write on src and test
npm test               # jest unit tests (*.spec.ts under src/)
npx jest path/to/file.spec.ts          # single test file
npx jest -t "test name"                # single test by name
npm run test:e2e       # jest with test/jest-e2e.json (test/*.e2e-spec.ts)
```

## Environment

Config is read from `.env` (gitignored) via `@nestjs/config`. `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE` are all required (`getOrThrow`), so the app will not boot without them. A Postgres instance must be reachable.

## Architecture

- `src/main.ts` bootstraps the app, enables CORS for `http://localhost:5173` (the frontend dev server) and sets a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`). DTOs must use `class-validator` decorators, since unknown properties are rejected.
- `src/database/database.module.ts` is the single place that configures `ConfigModule` (global) and `TypeOrmModule.forRootAsync`. Entities are discovered by the glob `**/*.entity{.ts,.js}`, so name entity files `*.entity.ts`. `synchronize` is `false`, so schema changes must go through migrations. `manualInitialization` is on when `NODE_ENV=test`, so in tests the DataSource has to be initialized explicitly.
- `src/database/data-source.ts` exports a standalone `AppDataSource` for the TypeORM CLI. It loads `.env` through `dotenv` and looks for migrations in `src/database/migrations/*`. The `migration:*` npm scripts (`create`, `generate`, `run`, `revert`, `show`) wrap the TypeORM CLI; see `src/database/README.md`.

## Gotchas

- In `main.ts`, `app.useGlobalPipes(...)` is called after `await app.listen(...)`. Global pipes registered after the app has started may not apply to routes. Move it before `listen` if validation doesn't seem to take effect.
- `dotenv` is imported in `data-source.ts` but is not a direct dependency (it comes in transitively through `@nestjs/config`).
- `src/app.controller.spec.ts` was deleted in the working tree, so there are currently no unit tests under `src/`.

## Code style

Prettier is configured with no semicolons, single quotes and trailing commas (`.prettierrc`). `.vscode/settings.json` also sets print width 100 and organizes imports on save. The Nest starter files (`main.ts`, `app.module.ts`) still use semicolons, while the newer `src/database/*` files follow the no-semicolon style; use the no-semicolon style for new code. TypeScript is non-strict (`strict: false`, only `strictNullChecks` on) with `module: nodenext`.
