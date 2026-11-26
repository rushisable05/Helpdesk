import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { parseId } from "../lib/parse-id";
import { ticketListQuerySchema, updateTicketSchema } from "core/schemas/tickets.ts";
import prisma from "../db";
import type { Prisma } from "../generated/prisma/client";
import { AI_AGENT_ID } from "core/constants/ai-agent.ts";
import { sendClassifyJob } from "../lib/classify-ticket";
import { sendAutoResolveJob } from "../lib/auto-resolve-ticket";

const bookEmailTicketSchema = z.object({
  senderName: z.string().trim().min(1, "Name is required"),
  senderEmail: z.string().trim().email("Valid email is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  body: z.string().trim().min(1, "Message is required"),
});

let statsFnUpdated = false;
async function ensureStatsFunction() {
  if (statsFnUpdated) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION get_ticket_stats(ai_agent_id TEXT)
      RETURNS TABLE (
        "totalTickets"      BIGINT,
        "openTickets"       BIGINT,
        "resolvedByAI"      BIGINT,
        "aiResolutionRate"  DOUBLE PRECISION,
        "avgResolutionTime" DOUBLE PRECISION
      )
      LANGUAGE sql STABLE
      AS $$
        WITH counts AS (
          SELECT
            COUNT(*)                                                         AS total_tickets,
            COUNT(*) FILTER (WHERE status IN ('new', 'open', 'processing'))  AS open_tickets,
            COUNT(*) FILTER (WHERE status = 'resolved' AND "assignedToId" IN (ai_agent_id, 'ai_agent', 'ai-agent')) AS resolved_by_ai,
            COUNT(*) FILTER (WHERE status = 'resolved')                      AS total_resolved,
            AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))) FILTER (WHERE status = 'resolved') AS avg_resolution
          FROM ticket
        )
        SELECT
          total_tickets       AS "totalTickets",
          open_tickets        AS "openTickets",
          resolved_by_ai      AS "resolvedByAI",
          CASE
            WHEN total_resolved > 0
            THEN ROUND((resolved_by_ai::DOUBLE PRECISION / total_resolved * 100)::NUMERIC, 1)::DOUBLE PRECISION
            ELSE 0
          END                 AS "aiResolutionRate",
          COALESCE(ROUND(avg_resolution::NUMERIC), 0)::DOUBLE PRECISION AS "avgResolutionTime"
        FROM counts;
      $$;
    `);
    statsFnUpdated = true;
  } catch (err) {
    console.warn("Could not refresh get_ticket_stats function:", err);
  }
}

interface TicketStatsRow {
  totalTickets: bigint;
  openTickets: bigint;
  resolvedByAI: bigint;
  aiResolutionRate: number;
  avgResolutionTime: number;
}

const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
  await ensureStatsFunction();
  const [row] = await prisma.$queryRaw<
    [TicketStatsRow]
  >`SELECT * FROM get_ticket_stats(${AI_AGENT_ID})`;

  res.json({
    totalTickets: Number(row.totalTickets),
    openTickets: Number(row.openTickets),
    resolvedByAI: Number(row.resolvedByAI),
    aiResolutionRate: row.aiResolutionRate,
    avgResolutionTime: row.avgResolutionTime,
  });
});

router.get("/stats/daily-volume", requireAuth, async (_req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const tickets = await prisma.ticket.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  // Build a map of date -> count
  const countsByDate = new Map<string, number>();
  for (const t of tickets) {
    const dateKey = t.createdAt.toISOString().slice(0, 10);
    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
  }

  // Fill in all 30 days (including zeros)
  const data: { date: string; tickets: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    data.push({ date: dateKey, tickets: countsByDate.get(dateKey) ?? 0 });
  }

  res.json({ data });
});

router.get("/", requireAuth, async (req, res) => {
  const query = validate(ticketListQuerySchema, req.query, res);
  if (!query) return;

  const where: Prisma.TicketWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: "insensitive" } },
      { senderName: { contains: query.search, mode: "insensitive" } },
      { senderEmail: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      subject: true,
      status: true,
      category: true,
      senderName: true,
      senderEmail: true,
      createdAt: true,
    },
    where,
    orderBy: { [query.sortBy]: query.sortOrder },
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  });

  const total = await prisma.ticket.count({ where });

  res.json({ tickets, total, page: query.page, pageSize: query.pageSize });
});

async function createAndAutoResolveTicket(data: z.infer<typeof bookEmailTicketSchema>) {
  const aiAgent = await prisma.user.findFirst({
    where: {
      OR: [
        { id: AI_AGENT_ID },
        { id: "ai_agent" },
        { id: "ai-agent" },
        { role: "agent" },
      ],
    },
  });

  const ticket = await prisma.ticket.create({
    data: {
      subject: data.subject,
      body: data.body,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      assignedToId: aiAgent?.id ?? null,
    },
  });

  await sendClassifyJob(ticket).catch((err) =>
    console.error(`Failed to classify ticket ${ticket.id}:`, err)
  );
  await sendAutoResolveJob(ticket).catch((err) =>
    console.error(`Failed to auto-resolve ticket ${ticket.id}:`, err)
  );

  const updated = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      replies: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return updated ?? ticket;
}

router.post("/public-book", async (req, res) => {
  const data = validate(bookEmailTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await createAndAutoResolveTicket(data);
  res.status(201).json({ ticket });
});

router.post("/book-email", requireAuth, async (req, res) => {
  const data = validate(bookEmailTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await createAndAutoResolveTicket(data);
  res.status(201).json({ ticket });
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(updateTicketSchema, req.body, res);
  if (!data) return;

  if (data.assignedToId) {
    const user = await prisma.user.findUnique({
      where: { id: data.assignedToId, deletedAt: null },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid agent" });
      return;
    }
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...("assignedToId" in data && { assignedToId: data.assignedToId }),
      ...("status" in data && { status: data.status }),
      ...("category" in data && { category: data.category }),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  res.json(updated);
});

export default router;
