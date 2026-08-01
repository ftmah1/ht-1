import { DB, TransformedForms } from "../types";
import { Insertable, Transaction, Kysely } from "kysely";

export function insertTransformedForm(
  executor: Kysely<DB> | Transaction<DB>,
  transformedForm: Insertable<TransformedForms>,
) {
  return executor.insertInto("transformedForms").values(transformedForm).executeTakeFirst();
}

export function updateEmailSent(executor: Kysely<DB>, applicationRef: string) {
  return executor
    .updateTable("transformedForms")
    .set({ emailSentAt: new Date() })
    .where("applicationReference", "=", applicationRef)
    .execute();
}

export function getAllFormsWithEmailNotSent(executor: Kysely<DB> | Transaction<DB>) {
  return executor
    .selectFrom("transformedForms")
    .selectAll()
    .where("emailSentAt", "is", null)
    .execute();
}
