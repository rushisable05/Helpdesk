import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import path from 'path';
import { openOrRecoverPGlite } from './db-helper';

async function main() {
  console.log('⚡ Initializing embedded PostgreSQL (PGlite)...');
  const dbPath = path.resolve(import.meta.dirname, '.pgdata');

  const db = await openOrRecoverPGlite(dbPath);

  const server = new PGLiteSocketServer({
    db,
    port: 5432,
    host: '127.0.0.1',
  });

  await server.start();
  console.log(`
┌────────────────────────────────────────────────────────────┐
│  🐘 Embedded PostgreSQL Server Running on 127.0.0.1:5432   │
│  ➜  Ready for Prisma & Better Auth                         │
│  ➜  Data directory: ${dbPath}
│  ➜  URL: postgresql://postgres:postgres@localhost:5432/helpdesk
└────────────────────────────────────────────────────────────┘
  `);

  const shutdown = async () => {
    console.log('Stopping database server...');
    await server.stop();
    await db.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Database server error:', err);
  process.exit(1);
});
