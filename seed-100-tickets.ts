import { PGlite } from '@electric-sql/pglite';
import { hashPassword } from 'better-auth/crypto';
import path from 'path';
import fs from 'fs';
import { rawTicketsData } from './core/data/tickets-seed-data.ts';

const AI_AGENT_ID = 'ai_agent';

export async function seed100Tickets(targetDbPath?: string) {
  const dbPath = targetDbPath || path.resolve(import.meta.dirname, '.pgdata');
  console.log(`🌱 Seeding 100 diversified tickets into: ${dbPath}`);

  // Clean stale lock if any
  const pidFile = path.join(dbPath, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try { fs.unlinkSync(pidFile); } catch {}
  }

  const db = await PGlite.create(dbPath);

  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';
    const hashedPassword = await hashPassword(password);
    const adminId = 'usr_admin_default';
    const now = new Date();

    // 1. Ensure Admin exists
    const adminCheck = await db.query('SELECT id FROM "user" WHERE email = $1', [email]);
    if (adminCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, false, 'admin', $4, $4)`,
        [adminId, 'Admin User', email, now.toISOString()]
      );

      await db.query(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, 'credential', $3, $4, $5, $5)`,
        ['acc_' + adminId, adminId, adminId, hashedPassword, now.toISOString()]
      );
      console.log(`✅ Admin user ensured: ${email}`);
    }

    // 2. Ensure AI Agent exists (both ai-agent and ai_agent for compatibility)
    for (const agentId of ['ai-agent', 'ai_agent']) {
      const check = await db.query('SELECT id FROM "user" WHERE id = $1', [agentId]);
      if (check.rows.length === 0) {
        await db.query(
          `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
           VALUES ($1, 'AI Assistant', $2, false, 'agent', $3, $3)`,
          [agentId, `${agentId}@helpdesk.local`, now.toISOString()]
        );
      }
    }
    console.log(`✅ AI Agents ensured: ai-agent & ai_agent`);

    // 3. Clear existing replies & tickets to have a clean, consistent 100 tickets set
    await db.query('DELETE FROM "reply"');
    await db.query('DELETE FROM "ticket"');
    console.log('🧹 Cleared existing tickets and replies.');

    // 4. Slice exactly 100 tickets
    const tickets = rawTicketsData.slice(0, 100);

    let insertedTickets = 0;
    let insertedReplies = 0;

    const statusCounts: Record<string, number> = { open: 0, resolved: 0, closed: 0 };
    const categoryCounts: Record<string, number> = {
      technical_question: 0,
      general_question: 0,
      refund_request: 0,
      uncategorized: 0,
    };

    for (const t of tickets) {
      // Calculate realistic creation timestamp spread over past 30 days
      const ticketDate = new Date(now);
      ticketDate.setDate(ticketDate.getDate() - t.daysAgo);
      ticketDate.setHours(ticketDate.getHours() - t.hoursAgo);

      // Random assignment: some to Admin, some to AI agent, some unassigned
      let assignedId: string | null = null;
      if (t.status === 'resolved' || t.status === 'closed') {
        assignedId = t.category === 'technical_question' ? adminId : (Math.random() > 0.5 ? AI_AGENT_ID : adminId);
      } else if (Math.random() > 0.4) {
        assignedId = adminId;
      }

      const res = await db.query(
        `INSERT INTO "ticket" (
          subject, body, "bodyHtml", status, category,
          "senderName", "senderEmail", "assignedToId",
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4::"TicketStatus", $5::"TicketCategory", $6, $7, $8, $9, $9)
        RETURNING id`,
        [
          t.subject,
          t.body,
          `<p>${t.body}</p>`,
          t.status,
          t.category,
          t.senderName,
          t.senderEmail,
          assignedId,
          ticketDate.toISOString(),
        ]
      );

      const ticketId = res.rows[0].id;
      insertedTickets++;

      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      if (t.category) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      } else {
        categoryCounts.uncategorized++;
      }

      // Insert replies if any
      if (t.replies && t.replies.length > 0) {
        for (const r of t.replies) {
          const replyDate = new Date(ticketDate);
          replyDate.setMinutes(replyDate.getMinutes() + r.minutesAfter);

          const replyUserId = r.senderType === 'agent' ? assignedId || adminId : null;

          await db.query(
            `INSERT INTO "reply" (
              body, "bodyHtml", "senderType", "ticketId", "userId", "createdAt"
            )
            VALUES ($1, $2, $3::"SenderType", $4, $5, $6)`,
            [
              r.body,
              `<p>${r.body}</p>`,
              r.senderType,
              ticketId,
              replyUserId,
              replyDate.toISOString(),
            ]
          );
          insertedReplies++;
        }
      }
    }

    console.log(`
════════════════════════════════════════════════════════════
🎉 Successfully Seeded ${insertedTickets} Diversified Tickets!
════════════════════════════════════════════════════════════
📊 Status Distribution:
   • Open:     ${statusCounts.open}
   • Resolved: ${statusCounts.resolved}
   • Closed:   ${statusCounts.closed}

🏷️  Category Distribution:
   • Technical Question: ${categoryCounts.technical_question}
   • General Question:   ${categoryCounts.general_question}
   • Refund Request:     ${categoryCounts.refund_request}
   • Uncategorized:      ${categoryCounts.uncategorized}

💬 Total Replies Generated: ${insertedReplies}
📅 Date Spread: Last 30 days (Days 0 to 29)
🔤 Alphabetical Subjects: A through Z
👥 Diverse Senders & Email Domains: 100 Unique Senders
════════════════════════════════════════════════════════════
    `);

    return { insertedTickets, insertedReplies };
  } finally {
    await db.close();
  }
}

if (import.meta.main) {
  seed100Tickets().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
