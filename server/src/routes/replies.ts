import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { parseId } from "../lib/parse-id";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createReplySchema, polishReplySchema } from "core/schemas/replies.ts";
import prisma from "../db";
import { sendEmailJob } from "../lib/send-email";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });

  res.json({ replies });
});

router.post("/", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(createReplySchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const reply = await prisma.reply.create({
    data: {
      body: data.body,
      senderType: "agent",
      ticketId,
      userId: req.user.id,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  await sendEmailJob({
    to: ticket.senderEmail,
    subject: `Re: ${ticket.subject}`,
    body: data.body,
  });

  res.status(201).json(reply);
});

export function polishReplyLocally(
  rawBody: string,
  customerName: string,
  agentName: string
): string {
  let cleaned = rawBody.trim();

  // Strip existing greeting if typed
  cleaned = cleaned.replace(/^(hi|hello|hey|dear)\s+[^,\n]+[,:\s]*/i, "");

  // Strip existing sign-off if typed
  cleaned = cleaned.replace(/(best\s+regards|regards|sincerely|thanks|thank\s+you|cheers)[\s\S]*$/i, "");
  cleaned = cleaned.replace(/https?:\/\/codewithmosh\.com/gi, "");
  cleaned = cleaned.replace(/https?:\/\/localhost:5173\/?/gi, "");
  cleaned = cleaned.trim();

  if (/^(ok|okay|done|fixed|resolved)\.?$/i.test(cleaned)) {
    cleaned = "This issue has been resolved.";
  }

  // Capitalize sentence beginnings
  cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());

  // Clean common abbreviations/informal typos
  const replacements: [RegExp, string][] = [
    [/\bpls\b|\bplz\b/gi, "please"],
    [/\bthx\b|\btnx\b/gi, "thank you"],
    [/\basap\b/gi, "as soon as possible"],
    [/\bu\b/g, "you"],
    [/\bur\b/g, "your"],
    [/\br\b/g, "are"],
    [/\bcant\b/gi, "cannot"],
    [/\bdont\b/gi, "do not"],
    [/\bwont\b/gi, "will not"],
    [/\bidk\b/gi, "I am looking into this"],
    [/\bits\b(?=\s+(?:a|the|working|fixed|being|done))/gi, "it is"],
  ];
  for (const [pattern, replacement] of replacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  if (cleaned && !/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return (
    `Hi ${customerName},\n\n` +
    `${cleaned}\n\n` +
    `Best regards,\n` +
    `${agentName}\n` +
    `http://localhost:5173/`
  );
}

router.post("/summarize", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  const conversation = replies
    .map((r) => {
      const sender =
        r.senderType === "agent" ? (r.user?.name ?? "Agent") : ticket.senderName;
      return `${sender}: ${r.body}`;
    })
    .join("\n\n");

  let summaryText = "";

  if (process.env.OPENAI_API_KEY) {
    try {
      const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const { text } = await generateText({
        model: openai(modelName),
        system:
          "You are a helpful assistant that summarizes support ticket conversations. " +
          "Provide a clear, concise summary that captures the customer's issue, any actions taken, and the current status. " +
          "Keep the summary to 2-4 sentences. Return only the summary with no preamble.",
        prompt:
          `Subject: ${ticket.subject}\n\n` +
          `Customer message:\n${ticket.body}\n\n` +
          (conversation ? `Conversation:\n${conversation}` : "No replies yet."),
      });
      summaryText = text;
    } catch (err) {
      console.warn("OpenAI summarize failed, using local summary fallback:", (err as Error).message);
    }
  }

  if (!summaryText) {
    const customerFirstName = ticket.senderName.split(" ")[0];
    const replyCount = replies.length;
    if (replyCount === 0) {
      summaryText = `${customerFirstName} reported: "${ticket.subject}". ${ticket.body.slice(0, 160)}${ticket.body.length > 160 ? "..." : ""} The ticket is currently ${ticket.status} with no replies yet.`;
    } else {
      const lastReply = replies[replies.length - 1];
      const lastSender = lastReply.senderType === "agent" ? (lastReply.user?.name ?? "Support") : customerFirstName;
      summaryText = `${customerFirstName} opened a ticket regarding "${ticket.subject}". There are ${replyCount} message(s) in this thread, with the latest update from ${lastSender}. The ticket is currently ${ticket.status}.`;
    }
  }

  res.json({ summary: summaryText });
});

router.post("/polish", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(polishReplySchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const agentName = req.user.name;
  const customerName = ticket.senderName.split(" ")[0];

  let polishedText = "";

  if (process.env.OPENAI_API_KEY) {
    try {
      const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const { text } = await generateText({
        model: openai(modelName),
        system:
          "You are a helpful writing assistant for a customer support team. " +
          "Improve the given reply for clarity, professional tone, and grammar. " +
          "Preserve the original meaning and keep the response concise. " +
          "Return only the improved text with no preamble or explanation. " +
          `Address the customer by their name: ${customerName}. ` +
          `End the reply with a sign-off using the agent's name: ${agentName}, and include the link http://localhost:5173/ on its own line after the sign-off.`,
        prompt: data.body,
      });
      polishedText = text;
    } catch (err) {
      console.warn("OpenAI polish failed, falling back to local polisher:", (err as Error).message);
    }
  }

  if (!polishedText) {
    polishedText = polishReplyLocally(data.body, customerName, agentName);
  }

  res.json({ body: polishedText });
});

export default router;
