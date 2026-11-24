import sgMail from "@sendgrid/mail";
import type { PgBoss } from "pg-boss";
import Sentry from "./sentry";

const QUEUE_NAME = "send-email";

interface SendEmailJobData {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
}

export async function registerSendEmailWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<SendEmailJobData>(QUEUE_NAME, async (jobs) => {
    const { to, subject, body, bodyHtml } = jobs[0]!.data;

    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject,
        text: body,
        ...(bodyHtml && { html: bodyHtml }),
      });

      console.log(`Email sent to ${to} — subject: "${subject}"`);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { queue: QUEUE_NAME },
      });
      throw error;
    }
  });
}

export async function sendEmailJob(data: SendEmailJobData): Promise<void> {
  // If background queue is in local mode and SendGrid credentials are provided, dispatch directly
  const isQueueEnabled = process.env.ENABLE_JOB_QUEUE === "true";
  if (!isQueueEnabled && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({
        to: data.to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: data.subject,
        text: data.body,
        ...(data.bodyHtml && { html: data.bodyHtml }),
      });
      console.log(`✉️ [SendGrid Direct] Outbound email sent to ${data.to} — subject: "${data.subject}"`);
      return;
    } catch (error: any) {
      console.error("❌ [SendGrid Direct] Failed to send email:", error?.response?.body || error?.message || error);
    }
  }

  const { boss } = await import("./queue");
  await boss.send(QUEUE_NAME, data);
}
