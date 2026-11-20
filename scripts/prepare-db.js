const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'server', 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.log('[prepare-db]: schema.prisma not found at', schemaPath);
  process.exit(0);
}

let schema = fs.readFileSync(schemaPath, 'utf8');
const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

if (isPostgres) {
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('[prepare-db]: Configured Prisma datasource provider to "postgresql".');
} else {
  // Keep sqlite for local development
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('[prepare-db]: Configured Prisma datasource provider to "sqlite".');
}
