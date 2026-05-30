"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const isPostgres = process.env["DB_PROVIDER"] === "postgresql";
exports.default = (0, config_1.defineConfig)({
    schema: isPostgres
        ? "prisma/schema.postgres.prisma"
        : "prisma/schema.prisma",
    migrations: {
        path: isPostgres ? "prisma/migrations-postgres" : "prisma/migrations",
        seed: "ts-node prisma/seed.ts",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});
//# sourceMappingURL=prisma.config.js.map