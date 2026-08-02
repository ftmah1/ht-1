import { initiasedDb } from "./shared/dependencies";
import { notifyTeamAndUpdateEmailSent } from "./shared/notifyTeamAndUpdateEmailSent";

export async function sweepPendingEmail() {
  try {
    const forms = await initiasedDb.getAllFormsWithEmailNotSent();
    await Promise.allSettled(
      forms.map((form) => notifyTeamAndUpdateEmailSent(form.applicationReference, initiasedDb)),
    );
  } catch (error) {
    console.error("Failed to process pending emails:", error);
  }
}
