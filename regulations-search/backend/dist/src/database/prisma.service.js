"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
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
                throw new Error('PostgreSQL connection URL specified but @prisma/adapter-pg and pg packages are not installed. ' +
                    'Please install them by running: npm install @prisma/adapter-pg pg');
            }
        }
        else {
            throw new Error(`Unsupported database provider in URL: ${databaseUrl}`);
        }
        super({ adapter });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map