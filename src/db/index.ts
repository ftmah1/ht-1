import "dotenv/config";
import { Pool } from "pg";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { DB } from "./types";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const pool = new Pool({ connectionString });

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});
