// Generates prisma/schema.postgres.prisma from the canonical prisma/schema.prisma
// by switching ONLY the datasource provider (sqlite -> postgresql).
//
// schema.prisma is the single source of truth for the data model. Never edit
// schema.postgres.prisma by hand — run `npm run db:pg:sync` to regenerate it.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'schema.prisma');
const dest = path.join(__dirname, 'schema.postgres.prisma');

let schema = fs.readFileSync(src, 'utf8');

if (!/provider\s*=\s*"sqlite"/.test(schema)) {
  throw new Error(
    'Expected `provider = "sqlite"` in prisma/schema.prisma (the canonical schema). Aborting.',
  );
}

schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');

const banner =
  '// AUTO-GENERATED from schema.prisma by `npm run db:pg:sync`.\n' +
  '// Do NOT edit by hand — edit prisma/schema.prisma and re-run the sync script.\n\n';

fs.writeFileSync(dest, banner + schema);
console.log('Wrote', path.relative(process.cwd(), dest));
