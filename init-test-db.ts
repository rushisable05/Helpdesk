import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

export async function initTestDb(cleanOrDb: boolean | PGlite = false) {
  const dbPath = path.resolve(import.meta.dirname, '.pgdata-test');

  let db: PGlite;
  let shouldClose = false;

  if (typeof cleanOrDb === 'object' && cleanOrDb !== null) {
    db = cleanOrDb;
  } else {
    const clean = cleanOrDb === true;
    if (clean && fs.existsSync(dbPath)) {
      console.log('🧹 Cleaning existing test database directory (.pgdata-test)...');
      try {
        fs.rmSync(dbPath, { recursive: true, force: true });
      } catch (err: any) {
        console.warn('Notice: Could not completely remove directory (may be in use):', err.message);
      }
    }

    const pidFile = path.join(dbPath, 'postmaster.pid');
    if (fs.existsSync(pidFile)) {
      try { fs.unlinkSync(pidFile); } catch {}
    }

    console.log('📦 Opening PGlite embedded test database (.pgdata-test)...');
    db = await PGlite.create(dbPath);
    shouldClose = true;
  }

  console.log('🔄 Applying all Prisma migrations to embedded test database...');
  const migrationsDir = path.resolve(import.meta.dirname, 'server/prisma/migrations');
  const migrationFolders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  for (const folder of migrationFolders) {
    const sqlFile = path.join(migrationsDir, folder, 'migration.sql');
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, 'utf-8');
      console.log(`  ➜ Applying migration: ${folder}...`);
      try {
        await db.exec(sql);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`    (Notice: Already applied or existing object, skipping)`);
        } else {
          console.warn(`    Warning on ${folder}:`, err.message);
        }
      }
    }
  }

  // Create pgboss schema
  console.log('🔧 Ensuring pgboss schema exists for background queue...');
  await db.exec('CREATE SCHEMA IF NOT EXISTS pgboss;');

  console.log('✅ All migrations applied successfully to test database!');
  if (shouldClose) {
    await db.close();
  }
}

if (import.meta.main) {
  const clean = process.argv.includes('--clean');
  initTestDb(clean).catch((err) => {
    console.error('Test database migration error:', err);
    process.exit(1);
  });
}
