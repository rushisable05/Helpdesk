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

export async function registerClassifyWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<ClassifyJobData>(QUEUE_NAME, async (jobs) => {
    const { ticketId, subject, body } = jobs[0]!.data;

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

      const category = text.trim() as TicketCategory;

      if (!ticketCategories.includes(category)) {
        console.warn(
          `Invalid category "${text.trim()}" returned for ticket ${ticketId}`
        );
        return;
      }

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { category },
      });
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

  let category: TicketCategory = classifyLocally(ticket.subject, ticket.body);
  if (process.env.OPENAI_API_KEY) {
    try {
      const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        system:
          "You are a support ticket classifier. " +
          "Classify the ticket into exactly one of these categories: " +
          `${ticketCategories.join(", ")}. ` +
          "Return only the category value with no extra text.",
        prompt: `Subject: ${ticket.subject}\n\nBody: ${ticket.body}`,
      });
      const candidate = text.trim() as TicketCategory;
      if (ticketCategories.includes(candidate)) {
        category = candidate;
      }
    } catch (error) {
      console.warn(`OpenAI classify fallback to local for ticket ${ticket.id}:`, error);
    }
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { category },
  });
  console.log(`🏷️ [AI Classify] Ticket #${ticket.id} classified as "${category}"`);
}
