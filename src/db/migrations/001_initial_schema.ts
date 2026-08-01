import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType("form_status").asEnum(["received", "ready", "errored"]).execute();

  await db.schema
    .createType("gender_transformed")
    .asEnum(["male", "female", "prefer-not-to-say"])
    .execute();

  await db.schema
    .createTable("ingested_forms")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("application_ref", "text", (col) => col.notNull().unique())
    .addColumn("raw_payload", "jsonb", (col) => col.notNull())
    .addColumn("status", sql`form_status`, (col) => col.notNull().defaultTo("received"))
    .addColumn("error_message", "text")
    .addColumn("received_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex("idx_ingested_forms_status")
    .on("ingested_forms")
    .columns(["status"])
    .where("status", "<>", "ready")
    .execute();

  await db.schema
    .createTable("transformed_forms")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("ingested_form_id", "uuid", (col) =>
      col.notNull().unique().references("ingested_forms.id").onDelete("cascade"),
    )
    .addColumn("session_id", "text", (col) => col.notNull())
    .addColumn("application_reference", "text", (col) => col.notNull())
    .addColumn("first_name", "text", (col) => col.notNull())
    .addColumn("last_name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("gender", sql`gender_transformed`, (col) => col.notNull())
    .addColumn("date_of_birth", "date", (col) => col.notNull())
    .addColumn("phone_number", "text")
    .addColumn("mobile_number", "text", (col) => col.notNull())
    .addColumn("address_line1", "text", (col) => col.notNull())
    .addColumn("address_line2", "text", (col) => col.notNull())
    .addColumn("address_line3", "text")
    .addColumn("postcode", "text", (col) => col.notNull())
    .addColumn("country", "text", (col) => col.notNull())
    .addColumn("latitude", "numeric", (col) => col.notNull())
    .addColumn("longitude", "numeric", (col) => col.notNull())
    .addColumn("email_sent_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex("idx_transformed_forms_email_pending")
    .on("transformed_forms")
    .columns(["created_at"])
    .where(sql.ref("email_sent_at"), "is", null)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("transformed_forms").execute();
  await db.schema.dropTable("ingested_forms").execute();
  await db.schema.dropType("gender_transformed").execute();
  await db.schema.dropType("form_status").execute();
}
