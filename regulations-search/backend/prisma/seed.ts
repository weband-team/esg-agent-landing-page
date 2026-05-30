import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
let adapter: any;

if (databaseUrl.startsWith('file:') || databaseUrl.includes('.db') || databaseUrl.includes('sqlite')) {
  adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
  });
} else if (databaseUrl.startsWith('postgres:') || databaseUrl.startsWith('postgresql:')) {
  try {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: databaseUrl });
    adapter = new PrismaPg(pool);
  } catch (err) {
    throw new Error(
      'PostgreSQL connection URL specified but @prisma/adapter-pg and pg packages are not installed.'
    );
  }
} else {
  throw new Error(`Unsupported database provider in URL: ${databaseUrl}`);
}

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // 1. Seed Regulations Catalog
  const regulationsPath = path.join(__dirname, '..', 'src', 'database', 'regulations_db.json');
  if (fs.existsSync(regulationsPath)) {
    const rawRegulations = fs.readFileSync(regulationsPath, 'utf8');
    const regulations = JSON.parse(rawRegulations);

    console.log(`Found ${regulations.length} regulations in regulations_db.json. Seeding...`);

    for (const reg of regulations) {
      await prisma.regulation.upsert({
        where: { regulation_id: reg.regulation_id },
        update: {
          area: reg.area,
          name: reg.name,
          obligation_name: reg.obligation_name,
          legal_level: reg.legal_level,
          legal_basis: reg.legal_basis,
          authority: reg.authority,
          official_source: reg.official_source,
          trigger_logic: reg.trigger_logic,
          trigger_data_fields: reg.trigger_data_fields,
          thresholds: reg.thresholds,
          obligation_type: reg.obligation_type,
          output_required: reg.output_required,
          portal_or_submission: reg.portal_or_submission,
          frequency: reg.frequency,
          deadline: reg.deadline,
          evidence_to_keep: reg.evidence_to_keep,
          penalty_risk: reg.penalty_risk,
          penalty_description: reg.penalty_description,
          owner_role: reg.owner_role,
          confidence_level: reg.confidence_level,
          pkd_codes: reg.pkd_codes || [],
        },
        create: {
          regulation_id: reg.regulation_id,
          area: reg.area,
          name: reg.name,
          obligation_name: reg.obligation_name,
          legal_level: reg.legal_level,
          legal_basis: reg.legal_basis,
          authority: reg.authority,
          official_source: reg.official_source,
          trigger_logic: reg.trigger_logic,
          trigger_data_fields: reg.trigger_data_fields,
          thresholds: reg.thresholds,
          obligation_type: reg.obligation_type,
          output_required: reg.output_required,
          portal_or_submission: reg.portal_or_submission,
          frequency: reg.frequency,
          deadline: reg.deadline,
          evidence_to_keep: reg.evidence_to_keep,
          penalty_risk: reg.penalty_risk,
          penalty_description: reg.penalty_description,
          owner_role: reg.owner_role,
          confidence_level: reg.confidence_level,
          pkd_codes: reg.pkd_codes || [],
        },
      });
    }
    console.log('Regulations seeding completed successfully!');
  } else {
    console.warn(`Regulations file not found at: ${regulationsPath}`);
  }

  // 2. Seed Mock Companies
  const companiesPath = path.join(__dirname, '..', 'src', 'database', 'mock_companies.json');
  if (fs.existsSync(companiesPath)) {
    const rawCompanies = fs.readFileSync(companiesPath, 'utf8');
    const companies = JSON.parse(rawCompanies);

    console.log(`Found ${companies.length} companies in mock_companies.json. Seeding...`);

    for (const comp of companies) {
      await prisma.company.upsert({
        where: { nip: comp.nip },
        update: {
          name: comp.name,
          krs: comp.krs || null,
          regon: comp.regon,
          legal_form: comp.legal_form,
          address: comp.address,
          pkd_codes: comp.pkd || [],
          employee_count: comp.employee_count || 0,
          revenue_pln: comp.revenue_pln || 0,
          assets_pln: comp.assets_pln || 0,
          is_mock: true,
        },
        create: {
          nip: comp.nip,
          name: comp.name,
          krs: comp.krs || null,
          regon: comp.regon,
          legal_form: comp.legal_form,
          address: comp.address,
          pkd_codes: comp.pkd || [],
          employee_count: comp.employee_count || 0,
          revenue_pln: comp.revenue_pln || 0,
          assets_pln: comp.assets_pln || 0,
          is_mock: true,
        },
      });
    }
    console.log('Companies seeding completed successfully!');
  } else {
    console.warn(`Mock companies file not found at: ${companiesPath}`);
  }

  console.log('Database seeding successfully finished.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
