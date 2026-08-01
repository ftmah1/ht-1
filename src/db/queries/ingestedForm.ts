import { Insertable, Transaction, Kysely } from "kysely";
import { DB, FormStatus, IngestedForms } from "../types";

export function insertIngestForm(executor: Kysely<DB>, ingestedForm: Insertable<IngestedForms>) {
  return executor
    .insertInto("ingestedForms")
    .values(ingestedForm)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function updateIngestedFormStatus(
  executor: Kysely<DB> | Transaction<DB>,
  formId: string,
  status: FormStatus,
  error: string | null,
) {
  return executor
    .updateTable("ingestedForms")
    .set({
      errorMessage: error,
      status,
    })
    .where("id", "=", formId)
    .execute();
}

export function getIngestedFormByApplicationRef(executor: Kysely<DB>, applicationRef: string) {
  return executor
    .selectFrom("ingestedForms")
    .selectAll()
    .where("applicationRef", "=", applicationRef)
    .executeTakeFirst();
}

export function getIngestedFormById(executor: Kysely<DB>, id: string) {
  return executor.selectFrom("ingestedForms").selectAll().where("id", "=", id).executeTakeFirst();
}
