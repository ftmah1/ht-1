# take-home-test

At Healthtech-1, one of our core responsibilities is to ingest registration forms, transform them, update some external systems and get them ready for future processing (by the FORM-BOT).
We are sent these forms by a particularly unreliable 3rd party - we should expect them to make schema changes without informing us, send duplicate forms, or generally just be badly behaved!
As this is important healthcare data, we need to design our systems to be resilient to these kinds of errors.

Your task is to code a system for ingesting and processing these forms. For a form to become ready for our bots, it will need to:

- Be ingested into a database (via an `/ingest` endpoint).
- Conform to the schema we've currently agreed with the external provider. This schema is found in `ingested_schema.ts` (but unfortunately the data source isn't 100% reliable and schema changes aren't always communicated in a timely fashion!)
- Have a longitude and latitude so that we have specific address information for the FORM-BOT. A mock implementation of a geocoding API (to transform the postcode into lat/long) is provided.
- Be transformed into the schema found in `transformed_schema.ts`.

In addition to this, if the transformation/another step is unsuccessful, we'd ideally like to be able to capture the error/data, ship a code change and then handle this form once that change has been deployed (e.g some kind of `/retry` endpoint)

Some additional notes on the system

- The third party external provider does not guarantee exactly once delivery
- We should never give the FORM-BOT the same form twice
- If the transform is successful, we should send a guaranteed email to our team happyforms@bots.com that a form was ingested

Some notes on this take home

- We expect you to add some basic tests to your code
- We expect you to use an actual database, as we'd like to see your schema design
- You can use AI to aid you in this task but please do not just ask Claude to do the whole thing for you
- You are free to pick another server technology (e.g. NestJS) if you wish and even pick another language though please check with us first on language.

How to submit

- The email sent to you has a unique submission link, which will take you to a submission portal
- Please submit on the portal: a link to your repository and a link to a 5 minute (max) loom which explains your code and some of your design decisions
- If possible, please submit within 4-5 days of receiving the task

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
