import { PGlite } from '@electric-sql/pglite';
import { hashPassword } from 'better-auth/crypto';
import path from 'path';
import dotenv from 'dotenv';
import { AI_AGENT_ID } from './core/constants/ai-agent.ts';

export async function seedTestDb(existingDb?: PGlite) {
  const envPath = path.resolve(import.meta.dirname, 'server/.env.test');
  dotenv.config({ path: envPath });

  let db: PGlite;
  let shouldClose = false;

  if (existingDb) {
    db = existingDb;
  } else {
    console.log('🌱 Opening PGlite test database for seeding (.pgdata-test)...');
    const dbPath = path.resolve(import.meta.dirname, '.pgdata-test');
    db = await PGlite.create(dbPath);
    shouldClose = true;
  }

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123';
  const hashedPassword = await hashPassword(password);
  const adminId = 'usr_admin_default';
  const now = new Date().toISOString();

  // 1. Check or insert Admin
  const adminCheck = await db.query('SELECT id FROM "user" WHERE email = $1', [email]);
  if (adminCheck.rows.length === 0) {
    await db.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, false, 'admin', $4, $4)`,
      [adminId, 'Admin', email, now]
    );

    await db.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, 'credential', $3, $4, $5, $5)`,
      ['acc_' + adminId, adminId, adminId, hashedPassword, now]
    );
    console.log(`✅ Test Admin user created: ${email} (Password: ${password})`);
  } else {
    console.log(`ℹ️ Test Admin user ${email} already exists.`);
  }

  // 2. Check or insert AI agent
  const aiCheck = await db.query('SELECT id FROM "user" WHERE id = $1', [AI_AGENT_ID]);
  if (aiCheck.rows.length === 0) {
    await db.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
       VALUES ($1, 'AI Assistant', 'ai@helpdesk.local', false, 'agent', $2, $2)`,
      [AI_AGENT_ID, now]
    );
    console.log(`✅ Test AI Agent user created.`);
  } else {
    console.log(`ℹ️ Test AI Agent user already exists.`);
  }

  if (shouldClose) {
    await db.close();
  }
  console.log('🎉 Test database seeding complete!');
}

if (import.meta.main) {
  seedTestDb().catch((err) => {
    console.error('Test database seeding error:', err);
    process.exit(1);
  });
}
