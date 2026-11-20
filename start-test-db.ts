import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import path from 'path';
import fs from 'fs';
import { initTestDb } from './init-test-db';
import { seedTestDb } from './seed-test-db';

async function main() {
  const dbPath = path.resolve(import.meta.dirname, '.pgdata-test');

  // Always remove stale postmaster.pid before boot
  const pidFile = path.join(dbPath, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try { fs.unlinkSync(pidFile); } catch {}
  }

  console.log('⚡ Initializing embedded PostgreSQL for tests (PGlite)...');
  const db = await PGlite.create(dbPath);

  console.log('⚡ Applying Prisma migrations to test database...');
  await initTestDb(db);

  console.log('⚡ Seeding initial test data...');
  await seedTestDb(db);

  const server = new PGLiteSocketServer({
    db,
    port: 5433,
    host: '127.0.0.1',
  });

  await server.start();

  // Lightweight HTTP health-check endpoint for Playwright webServer readiness checks
  const healthServer = Bun.serve({
    port: 5434,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok', db: 'helpdesk_test', port: 5433 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not Found', { status: 404 });
    },
  });

  console.log(`
┌────────────────────────────────────────────────────────────┐
│  🧪 Embedded TEST PostgreSQL Server Running on 127.0.0.1:5433 │
│  ➜  Health check: http://127.0.0.1:5434/health             │
│  ➜  Ready for Playwright E2E Tests                         │
│  ➜  Data directory: ${dbPath}                              │
│  ➜  Database URL: postgresql://postgres:postgres@localhost:5433/helpdesk_test
└────────────────────────────────────────────────────────────┘
  `);

  const shutdown = async () => {
    console.log('Stopping test database server...');
    healthServer.stop();
    await server.stop();
    await db.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Test database server error:', err);
  process.exit(1);
});
