import { PGlite } from '@electric-sql/pglite';
import { hashPassword } from 'better-auth/crypto';
import path from 'path';

const AI_AGENT_ID = 'ai_agent';

async function seed() {
  console.log('🌱 Opening PGlite database for seeding...');
  const dbPath = path.resolve(import.meta.dirname, '.pgdata');
  const db = await PGlite.create(dbPath);

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';
  const hashedPassword = await hashPassword(password);
  const adminId = 'usr_admin_default';
  const now = new Date().toISOString();

  // 1. Check or insert Admin
  const adminCheck = await db.query('SELECT id FROM "user" WHERE email = $1', [email]);
  if (adminCheck.rows.length === 0) {
    await db.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, false, 'admin', $4, $4)`,
      [adminId, 'Admin User', email, now]
    );

    await db.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, 'credential', $3, $4, $5, $5)`,
      ['acc_' + adminId, adminId, adminId, hashedPassword, now]
    );
    console.log(`✅ Admin user created: ${email} (Password: ${password})`);
  } else {
    console.log(`ℹ️ Admin user ${email} already exists.`);
  }

  // 2. Check or insert AI agent
  const aiCheck = await db.query('SELECT id FROM "user" WHERE id = $1', [AI_AGENT_ID]);
  if (aiCheck.rows.length === 0) {
    await db.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
       VALUES ($1, 'AI Assistant', 'ai@helpdesk.local', false, 'agent', $2, $2)`,
      [AI_AGENT_ID, now]
    );
    console.log(`✅ AI Agent user created.`);
  } else {
    console.log(`ℹ️ AI Agent user already exists.`);
  }

  // 3. Seed sample tickets if empty
  const ticketCount = await db.query('SELECT count(*) FROM "ticket"');
  const count = parseInt(ticketCount.rows[0].count as string, 10);

  if (count === 0) {
    console.log('📝 Seeding sample tickets...');
    const sampleTickets = [
      {
        subject: 'Cannot access React 19 course videos',
        body: 'Whenever I click on Module 3, the video player remains black with a spinning loader.',
        status: 'open',
        category: 'technical_question',
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
      },
      {
        subject: 'Invoice request for annual subscription',
        body: 'Could you please send me a PDF invoice with our company VAT number for our accounting department?',
        status: 'open',
        category: 'general_question',
        senderName: 'Sarah Connor',
        senderEmail: 'sarah@skynet-research.org',
      },
      {
        subject: 'Refund request - purchased duplicate bundle',
        body: 'I accidentally bought the Ultimate TypeScript bundle twice with two different email addresses. Can I get a refund on order #49102?',
        status: 'resolved',
        category: 'refund_request',
        senderName: 'Michael Scott',
        senderEmail: 'michael@dundermifflin.com',
      },
      {
        subject: 'TypeScript compiler configuration issue with Bun',
        body: 'I am getting TS2740 when running bun build. Can someone verify the recommended tsconfig compilerOptions?',
        status: 'open',
        category: 'technical_question',
        senderName: 'Alex Rivera',
        senderEmail: 'alex.rivera@dev.io',
      },
    ];

    for (const t of sampleTickets) {
      const res = await db.query(
        `INSERT INTO "ticket" (subject, body, status, category, "senderName", "senderEmail", "assignedToId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3::"TicketStatus", $4::"TicketCategory", $5, $6, $7, $8, $8) RETURNING id`,
        [t.subject, t.body, t.status, t.category, t.senderName, t.senderEmail, adminId, now]
      );
      const ticketId = res.rows[0].id;

      // Add a reply
      await db.query(
        `INSERT INTO "reply" (body, "senderType", "ticketId", "userId", "createdAt")
         VALUES ($1, 'agent'::"SenderType", $2, $3, $4)`,
        ['Thank you for reaching out! Our support team is investigating this issue right away.', ticketId, adminId, now]
      );
    }
    console.log(`✅ Sample tickets and initial replies seeded successfully!`);
  } else {
    console.log(`ℹ️ Tickets table already contains ${count} tickets.`);
  }

  await db.close();
  console.log('🎉 Database seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
