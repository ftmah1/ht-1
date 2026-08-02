# How to run
1. `npm install` 
2. `npm run build`
3. Follow steps in database section of this readme below.
4. `npm start`


## Database

The project uses Postgres via Docker, [Kysely](https://kysely.dev) as the query builder, and
[kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen) to generate TypeScript types
directly from the database schema.

### First-time setup

```
cp .env.example .env   # only if .env doesn't already exist
npm run db:setup
```

This starts the Postgres container, runs all migrations, and generates `src/db/types.ts` from
the resulting schema.

### Changing the schema

1. Add a new migration file to `src/db/migrations/` (e.g. `002_add_something.ts`), exporting
   `up`/`down` functions written with Kysely's schema builder.
2. Run `npm run migrate` to apply it.
3. Run `npm run db:types` to regenerate `src/db/types.ts`.

Types are generated rather than hand-written because the database is the single source of
truth for the schema. If a migration changes a column and the types aren't regenerated to
match, application code using the old shape fails to compile instead of failing silently at
runtime — the compiler catches drift between the schema and the code immediately.

### Scripts

| Script                 | What it does                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run db:up`        | Starts the Postgres container (`docker compose up -d`)                                                  |
| `npm run db:down`      | Stops the Postgres container                                                                            |
| `npm run db:reset`     | Stops the container, deletes its volume, and starts fresh                                               |
| `npm run migrate`      | Runs all pending migrations                                                                             |
| `npm run migrate:down` | Rolls back the most recent migration                                                                    |
| `npm run db:types`     | Regenerates `src/db/types.ts` from the running database                                                 |
| `npm run db:setup`     | Runs `db:up`, waits for Postgres to be ready, then `migrate` and `db:types` — the full first-time setup |
