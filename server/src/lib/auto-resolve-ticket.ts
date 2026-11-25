import fs from "fs";
import path from "path";
import type { PgBoss } from "pg-boss";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import Sentry from "./sentry";
import prisma from "../db";
import { sendEmailJob } from "./send-email";

const QUEUE_NAME = "auto-resolve-ticket";

const knowledgeBase = fs.readFileSync(
  path.join(import.meta.dirname, "../../knowledge-base.md"),
  "utf-8"
);

interface AutoResolveJobData {
  ticketId: number;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
}

export async function registerAutoResolveWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<AutoResolveJobData>(QUEUE_NAME, async (jobs) => {
    const { ticketId, subject, body, senderName, senderEmail } = jobs[0]!.data;
    const firstName = senderName.split(" ")[0];

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "processing" },
    });

    let response: string;
    try {
      const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        system:
          "You are a friendly and professional support agent for Code with Mosh. " +
          "Use ONLY the following knowledge base to answer the customer's question.\n\n" +
          knowledgeBase +
          "\n\n" +
          "Guidelines for your response:\n" +
          `- Address the customer by their first name: ${firstName}\n` +
          "- Use a warm, professional, and customer-friendly tone\n" +
          "- Format the response clearly with line breaks between paragraphs\n" +
          "- Use bullet points or numbered lists when listing steps or multiple items\n" +
          "- End with an offer to help further, e.g. 'If you have any other questions, feel free to reach out.'\n" +
          "- Sign off with:\n\nBest regards,\nCode with Mosh Support\n\n" +
          "If the knowledge base does NOT contain enough information to fully resolve the question, " +
          'respond with exactly "ESCALATE" and nothing else.',
        prompt: `Subject: ${subject}\n\nBody: ${body}`,
      });
      response = text.trim();
    } catch (error) {
      Sentry.captureException(error, {
        tags: { queue: QUEUE_NAME, ticketId },
      });
      console.error(`Auto-resolve AI call failed for ticket ${ticketId}:`, error);
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "open", assignedToId: null },
      });
      return;
    }

    if (response === "ESCALATE") {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "open", assignedToId: null },
      });
    } else {
      try {
        await prisma.$transaction([
          prisma.reply.create({
            data: {
              body: response,
              senderType: "agent",
              ticketId,
              userId: null,
            },
          }),
          prisma.ticket.update({
            where: { id: ticketId },
            data: { status: "resolved" },
          }),
        ]);

        await sendEmailJob({
          to: senderEmail,
          subject: `Re: ${subject}`,
          body: response,
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { queue: QUEUE_NAME, ticketId },
        });
        throw error;
      }
    }
  });
}

export function generateLocalAIReply(
  subject: string,
  body: string,
  senderName: string
): string {
  const firstName = senderName.trim().split(/\s+/)[0] || "there";
  const text = `${subject} ${body}`.toLowerCase();

  let answer: string;
  if (/\b(refund|money\s*back)\b/.test(text)) {
    answer =
      "Thank you for reaching out regarding a refund.\n\n" +
      "Here is our refund policy:\n" +
      "- We offer a 30-day money-back guarantee from the date of purchase.\n" +
      "- Full refunds are available within 30 days if less than 80% of the course is completed.\n" +
      "- Approved refunds are processed within 5–10 business days.\n\n" +
      "Please share your order receipt if you haven't already, and we will process this right away.";
  } else if (/\b(login|password|reset|access|account)\b/.test(text)) {
    answer =
      "Thank you for contacting support regarding your account and login access.\n\n" +
      "Please try the following steps:\n" +
      "1. Go to the login page and click Forgot Password.\n" +
      "2. Enter your registered email address and check both your Inbox and Spam/Promotions folders.\n" +
      "3. Verify you are signing in with the exact email address used during purchase or payment.";
  } else if (/\b(payment|billing|invoice|receipt|subscription)\b/.test(text)) {
    answer =
      "Thank you for reaching out about your payment.\n\n" +
      "If your payment is still processing or your access hasn't updated yet, please check your receipt email for confirmation and wait a few minutes for synchronization. We have also flagged your account for verification.";
  } else if (/\b(certificate|certificates)\b/.test(text)) {
    answer =
      "Yes! A completion certificate is automatically issued once you complete 100% of a course, and you can download it directly from your dashboard.";
  } else if (/\b(video|download|quality|playing|slow)\b/.test(text)) {
    answer =
      "For playback or video issues, please try:\n" +
      "- Clearing your browser cache and using the latest Chrome or Edge browser.\n" +
      "- Disabling ad-blockers or extensions temporarily.\n" +
      "- Checking your internet connection (video quality adjusts automatically; source code is downloadable).";
  } else {
    answer =
      `We have received your request regarding "${subject}".\n\n` +
      "Our AI Support Assistant has logged your ticket and is reviewing the details. You can track all updates directly on your support portal.";
  }

  return (
    `Hi ${firstName},\n\n` +
    `${answer}\n\n` +
    `If you have any other questions, feel free to reply directly to this email.\n\n` +
    `Best regards,\n` +
    `AI Support Assistant\n` +
    `http://localhost:5173/`
  );
}

export async function sendAutoResolveJob(ticket: {
  id: number;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
}): Promise<void> {
  if (process.env.ENABLE_JOB_QUEUE === "true") {
    const { boss } = await import("./queue");
    await boss.send(QUEUE_NAME, {
      ticketId: ticket.id,
      subject: ticket.subject,
      body: ticket.body,
      senderName: ticket.senderName,
      senderEmail: ticket.senderEmail,
    });
    return;
  }

  const firstName = ticket.senderName.trim().split(/\s+/)[0] || "there";
  let response: string | null = null;

  if (process.env.OPENAI_API_KEY) {
    try {
      const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        system:
          "You are a friendly and professional support agent for Code with Mosh. " +
          "Use ONLY the following knowledge base to answer the customer's question.\n\n" +
          knowledgeBase +
          "\n\n" +
          "Guidelines for your response:\n" +
          `- Address the customer by their first name: ${firstName}\n` +
          "- Use a warm, professional, and customer-friendly tone\n" +
          "- Format the response clearly with line breaks between paragraphs\n" +
          "- End with an offer to help further\n" +
          "- Sign off with:\n\nBest regards,\nAI Support Assistant\nhttp://localhost:5173/",
        prompt: `Subject: ${ticket.subject}\n\nBody: ${ticket.body}`,
      });
      if (text.trim() && text.trim() !== "ESCALATE") {
        response = text.trim();
      }
    } catch (error) {
      console.warn(`OpenAI auto-resolve fallback to local AI for ticket ${ticket.id}:`, error);
    }
  }

  if (!response) {
    response = generateLocalAIReply(ticket.subject, ticket.body, ticket.senderName);
  }

  const aiAgent = await prisma.user.findFirst({
    where: { OR: [{ id: "ai-agent" }, { id: "ai_agent" }, { role: "agent" }] },
  });

  await prisma.$transaction([
    prisma.reply.create({
      data: {
        body: response,
        senderType: "agent",
        ticketId: ticket.id,
        userId: aiAgent?.id ?? null,
      },
    }),
    prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "resolved",
        ...(aiAgent ? { assignedToId: aiAgent.id } : {}),
      },
    }),
  ]);

  await sendEmailJob({
    to: ticket.senderEmail,
    subject: `Re: ${ticket.subject}`,
    body: response,
  });

  console.log(`🤖✉️ [AI Auto-Reply] Ticket #${ticket.id} resolved and emailed to ${ticket.senderEmail}`);
}
