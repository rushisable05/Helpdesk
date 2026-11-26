import type { PgBoss } from "pg-boss";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  ticketCategories,
  type TicketCategory,
} from "core/constants/ticket-category.ts";
import Sentry from "./sentry";
import prisma from "../db";

const QUEUE_NAME = "classify-ticket";

interface ClassifyJobData {
  ticketId: number;
  subject: string;
  body: string;
}

async function resolveCategory(
  ticketId: number,
  subject: string,
  body: string
): Promise<void> {
  let category: TicketCategory = classifyLocally(subject, body);

  if (process.env.OPENAI_API_KEY) {
    try {
      const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        system:
          "You are a support ticket classifier. " +
          "Classify the ticket into exactly one of these categories: " +
          `${ticketCategories.join(", ")}. ` +
          "Return only the category value with no extra text.",
        prompt: `Subject: ${subject}\n\nBody: ${body}`,
      });
      const candidate = text.trim() as TicketCategory;
      if (ticketCategories.includes(candidate)) {
        category = candidate;
      }
    } catch (error) {
      console.warn(`OpenAI classify fallback to local for ticket ${ticketId}:`, error);
    }
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { category },
  });
  console.log(`🏷️ [AI Classify] Ticket #${ticketId} classified as "${category}"`);
}

export async function registerClassifyWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<ClassifyJobData>(QUEUE_NAME, async (jobs) => {
    const { ticketId, subject, body } = jobs[0]!.data;
    try {
      await resolveCategory(ticketId, subject, body);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { queue: QUEUE_NAME, ticketId },
      });
      throw error;
    }
  });
}

export function classifyLocally(subject: string, body: string): TicketCategory {
  const text = `${subject} ${body}`.toLowerCase();
  if (/\b(refund|money\s*back|chargeback|cancel|billing|payment)\b/.test(text)) {
    return "refund_request";
  }
  if (/\b(login|password|error|bug|video|play|download|access|crash|broken|issue|not working)\b/.test(text)) {
    return "technical_question";
  }
  return "general_question";
}

export async function sendClassifyJob(ticket: {
  id: number;
  subject: string;
  body: string;
}): Promise<void> {
  if (process.env.ENABLE_JOB_QUEUE === "true") {
    const { boss } = await import("./queue");
    await boss.send(QUEUE_NAME, {
      ticketId: ticket.id,
      subject: ticket.subject,
      body: ticket.body,
    });
    return;
  }

  await resolveCategory(ticket.id, ticket.subject, ticket.body);
}
