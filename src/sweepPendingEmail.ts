import { FormRepository } from "./forms/formRepository/formRepositoryInterface";
import { notifyTeamAndUpdateEmailSent } from "./shared/notifyTeamAndUpdateEmailSent";

export async function sweepPendingEmail(formRepository: FormRepository) {
  try {
    console.log('sweeping email for all forms with email not sent');
    const forms = await formRepository.getAllFormsWithEmailNotSent();
    await Promise.allSettled(
      forms.map((form) => notifyTeamAndUpdateEmailSent(form.applicationReference, formRepository)),
    );
  } catch (error) {
    console.error("Failed to process pending emails:", error);
  }
}
