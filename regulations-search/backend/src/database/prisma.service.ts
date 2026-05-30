import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
    let adapter: any;

    if (databaseUrl.startsWith('file:') || databaseUrl.includes('.db') || databaseUrl.includes('sqlite')) {
      adapter = new PrismaBetterSqlite3({
        url: databaseUrl,
      });
    } else if (databaseUrl.startsWith('postgres:') || databaseUrl.startsWith('postgresql:')) {
      try {
        // Dynamically load postgres adapter and pool if used in production
        const { PrismaPg } = require('@prisma/adapter-pg');
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: databaseUrl });
        adapter = new PrismaPg(pool);
      } catch (err) {
        throw new Error(
          'PostgreSQL connection URL specified but @prisma/adapter-pg and pg packages are not installed. ' +
          'Please install them by running: npm install @prisma/adapter-pg pg'
        );
      }
    } else {
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
}
