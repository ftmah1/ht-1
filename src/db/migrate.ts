import "dotenv/config";
import * as path from "path";
import { promises as fs } from "fs";
import { Pool } from "pg";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// from kysely docs it recommends to use any type for the database schema when using migrations,
// as the schema may not match the current state of the database during migration.
const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),
  }),
});

async function migrate() {
  const command = process.argv[2];

  const { error, results } =
    command === "down" ? await migrator.migrateDown() : await migrator.migrateToLatest();

  results?.forEach((result) => {
    console.log(`${result.migrationName}: ${result.status}`);
  });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate().finally(() => db.destroy());
