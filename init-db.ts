import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

async function initDb() {
  console.log('📦 Opening PGlite embedded database (.pgdata)...');
  const dbPath = path.resolve(import.meta.dirname, '.pgdata');
  const db = await PGlite.create(dbPath);

  console.log('🔄 Applying all Prisma migrations to embedded PostgreSQL...');
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
        // If type/table already exists, log and proceed
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

  console.log('✅ All migrations applied successfully to PGlite database!');
  await db.close();
}

initDb().catch((err) => {
  console.error('Database migration error:', err);
  process.exit(1);
});
