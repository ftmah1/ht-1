import { db } from "./db";
import { getAllFormsWithEmailNotSent } from "./db/queries/transformedForm";
import { notifyTeamAndUpdateEmailSent } from "./shared/notifyTeamAndUpdateEmailSent";

export async function sweepPendingEmail() {
  try {
    const forms = await getAllFormsWithEmailNotSent(db);
    await Promise.allSettled(
      forms.map((form) => notifyTeamAndUpdateEmailSent(form.applicationReference)),
    );
  } catch (error) {
    console.error("Failed to process pending emails:", error);
  }
}
