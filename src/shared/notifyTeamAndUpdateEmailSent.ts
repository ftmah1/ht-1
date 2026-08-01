import { sendEmail } from "../providers/sendgrid";
import { updateEmailSent } from "../db/queries/transformedForm";
import { db } from "../db";

export async function notifyTeamAndUpdateEmailSent(applicationRef: string) {
  const { statusCode } = await sendEmail({
    to: "happyforms@bots.com",
    from: "noreply@healthtech1.com",
    subject: applicationRef,
    body: `Application ${applicationRef} has been ingested`,
  });
  if (statusCode === 200) {
    await updateEmailSent(db, applicationRef);
  }
}
