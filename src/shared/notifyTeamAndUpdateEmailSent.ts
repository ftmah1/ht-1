import { sendEmail } from "../providers/sendgrid";
import { withRetry } from "./retry";
import { FormRepository } from "../forms/formRepository/formRepositoryInterface";

export async function notifyTeamAndUpdateEmailSent(
  applicationRef: string,
  formRepository: FormRepository,
) {
  const { statusCode } = await withRetry(() =>
    sendEmail({
      to: "happyforms@bots.com",
      from: "noreply@healthtech1.com",
      subject: applicationRef,
      body: `Application ${applicationRef} has been ingested`,
    }),
  );
  if (statusCode === 200) {
    await formRepository.updateEmailSent(applicationRef);
  }
}
