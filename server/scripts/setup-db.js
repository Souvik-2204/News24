const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

console.log(`[DB Setup] Database URL detected: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const postgresSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');

if (isPostgres && fs.existsSync(postgresSchemaPath)) {
  console.log('[DB Setup] Using PostgreSQL schema configuration...');
  fs.copyFileSync(postgresSchemaPath, schemaPath);
}

try {
  console.log('[DB Setup] Generating Prisma Client...');
  execSync('npx prisma generate', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('[DB Setup] Pushing schema to database...');
  execSync('npx prisma db push --skip-generate', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('[DB Setup] Seeding database...');
  execSync('node prisma/seed.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('[DB Setup] Database setup completed successfully!');
} catch (error) {
  console.error('[DB Setup] Error during database setup:', error.message);
  process.exit(1);
}
