"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
let adapter;
if (databaseUrl.startsWith('file:') || databaseUrl.includes('.db') || databaseUrl.includes('sqlite')) {
    adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
        url: databaseUrl,
    });
}
else if (databaseUrl.startsWith('postgres:') || databaseUrl.startsWith('postgresql:')) {
    try {
        const { PrismaPg } = require('@prisma/adapter-pg');
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: databaseUrl });
        adapter = new PrismaPg(pool);
    }
    catch (err) {
        throw new Error('PostgreSQL connection URL specified but @prisma/adapter-pg and pg packages are not installed.');
    }
}
else {
    throw new Error(`Unsupported database provider in URL: ${databaseUrl}`);
}
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Starting database seed...');
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
    }
    else {
        console.warn(`Regulations file not found at: ${regulationsPath}`);
    }
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
    }
    else {
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
//# sourceMappingURL=seed.js.map