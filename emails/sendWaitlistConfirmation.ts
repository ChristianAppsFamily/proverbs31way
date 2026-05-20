import { resend } from "../lib/resend";
import WaitlistConfirmation, {
  WAITLIST_CONFIRMATION_SUBJECT,
} from "./WaitlistConfirmation";

export async function sendWaitlistConfirmation(to: string) {
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ?? "hello@proverbs31way.com";

  return resend.emails.send({
    from: `The Way <${fromAddress}>`,
    to,
    subject: WAITLIST_CONFIRMATION_SUBJECT,
    react: WaitlistConfirmation(),
  });
}
