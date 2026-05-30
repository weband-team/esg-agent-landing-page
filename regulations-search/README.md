# 🇵🇱 Regulator: Polish Company ESG & Legal Compliance Checker

**Regulator** is a premium, enterprise-grade RegTech compliance platform designed to help Polish companies instantly identify their national and European legal, ESG, and operational obligations.

By inputting a Polish **NIP (Tax Identification Number)**, the platform automatically validates the checksum, retrieves official corporate records (using the live Polish Ministry of Finance Whitelist API or local database models), analyzes company profile metrics (revenue, employees, assets, legal form, and PKD industry codes), and runs a **7-step Matching Engine** to generate a highly detailed, bilingual compliance roadmap and printable PDF report.

---

## 🚀 Key Features

*   **⚡ Real-Time Progress Stream (SSE)**: Fully interactive, animated stepper streaming progress logs from the backend matching engine down to a retro-themed RegTech terminal dashboard.
*   **🔍 Live Ministry of Finance KAS White List API**: Built-in async integration to query live Polish taxpayer registers with smart timezone adjustment to guarantee high uptime.
*   **🛠️ Advanced Sizing Parameters Accordion**: An interactive configuration panel that allows users to manually override headcount, revenue, and balance sheet assets to test regulatory implications.
*   **🧩 Hybrid Database Layer (Prisma ORM)**: Supports SQLite for rapid local development and PostgreSQL or MySQL for production. Out-of-the-box offline resilience automatically falls back to local JSON flat-file storage if the database is unconfigured.
*   **📄 High-Fidelity Text-Selectable PDF Reports**: Generates pixel-perfect corporate compliance reports with nested tables, custom margins, and full Polish diacritic (`ą, ć, ę, ł, ń, ó, ś, ź, ż`) font embeds.
*   **♿ Accessible & Responsive Design**: Custom glassmorphism layout, WCAG 2.1 AA compliant semantic HTML, and full viewport responsiveness down to 360px.

---

## 📂 Repository Architecture

The project is structured as an integrated monorepo using **npm workspaces**:

```
esg-agent-regulation-search/
├── backend/                  # NestJS API & Matching Engine
│   ├── prisma/               # Database Schema, Migrations, and Seed script
│   │   ├── schema.prisma     # Prisma datasource & model mapping (bilingual JSON fields)
│   │   └── seed.ts           # Seeding script for regulations and sandbox companies
│   ├── src/
│   │   ├── database/         # PrismaService & JSON database catalogs
│   │   ├── modules/
│   │   │   ├── lookup/       # NIP validator & live government API search
│   │   │   ├── matching/     # 7-Step regulation matching engine
│   │   │   └── pdf/          # Dynamic PDF generation engine
│   │   └── main.ts           # NestJS Server Entrypoint (Default Port 3000)
│   └── package.json
│
├── frontend/                 # Next.js Interactive Dashboard
│   ├── src/
│   │   ├── app/              # Next.js App Router (Bilingual Polish/English UI)
│   │   └── components/       # Steppers, Glassmorphic Cards, Terminal Console
│   └── package.json
│
├── package.json              # Monorepo Workspace Config & Universal Scripts
└── README.md                 # Project Documentation
```

---

## 🛠️ Local Development Quickstart

### Prerequisites
*   **Node.js**: `v18.x` or higher
*   **npm**: `v9.x` or higher

### 1. Installation
Clone the repository and install all dependencies from the root directory:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder (or use the preconfigured local defaults):
```env
PORT=3000
DATABASE_URL="file:./dev.db"
```

### 3. Database Migrations & Seeding
Set up your SQLite database, apply schema migrations, generate the client typings, and seed the regulations catalogue and sandbox companies:
```bash
# Move to the backend folder
cd backend

# Run Prisma migrations to initialize dev.db
npx prisma migrate dev --name init

# Generate local Prisma Client typings
npx prisma generate

# Seed the database from local JSON catalogues
npx prisma db seed

# Return to root directory
cd ..
```

### 4. Start Development Servers
Boot both the backend NestJS server (`http://localhost:3000`) and the Next.js frontend app (`http://localhost:3001`) concurrently:
```bash
npm run dev
```

---

## 🏁 Production Launch & Server Deployment

To host this application in production environments, use the following operational procedures.

### 🌐 Environment Configurations
Always configure these environment variables on your production server:

| Environment Variable | Description | Default Value | Example Production Value |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Running node environment context | `development` | `production` |
| `PORT` | Backend application listening port | `3000` | `8080` |
| `DATABASE_URL` | Prisma Database connection URL | `file:./dev.db` | `postgresql://user:pass@host:5432/esg_regulator` |
| `NEXT_PUBLIC_API_URL` | Public frontend endpoint of the backend API | `http://localhost:3000/api` | `https://api.regulator.domain.com/api` |

### 🗄️ Production Database Setup (PostgreSQL Example)
Prisma 7 uses optimized driver adapters to talk to production databases securely.
When running with a PostgreSQL database:

The database engine is selected at deploy time via the `DB_PROVIDER` env var.
It defaults to `sqlite` (local dev); set it to `postgresql` for production. The
data model lives in a single source of truth (`prisma/schema.prisma`); the
PostgreSQL schema (`prisma/schema.postgres.prisma`) and its migrations
(`prisma/migrations-postgres/`) are kept in sync from it automatically.

1. Update your backend `.env` configuration to use your PostgreSQL URI and engine:
   ```env
   DB_PROVIDER="postgresql"
   DATABASE_URL="postgresql://esg_user:secure_password@postgres-db-host:5432/esg_regulator?schema=public"
   ```
2. Install the necessary runtime packages inside the backend folder:
   ```bash
   cd backend
   npm install @prisma/adapter-pg pg
   npm install --save-dev @types/pg
   ```
3. Generate the client, apply migrations, and seed the production database in one step:
   ```bash
   # Sync the pg schema, generate the client, migrate deploy, and seed
   npm run db:setup:pg
   ```
   …or run the individual steps:
   ```bash
   npm run db:generate:pg   # sync pg schema + generate Prisma Client
   npm run db:deploy:pg     # apply migrations to the PostgreSQL database
   npm run db:seed:pg       # populate regulations catalogue & sandbox companies
   ```

> **Note:** Whenever you change `prisma/schema.prisma`, regenerate the PostgreSQL
> schema and create a matching migration:
> ```bash
> npm run db:pg:sync       # regenerate prisma/schema.postgres.prisma
> DB_PROVIDER=postgresql npx prisma migrate dev --name <change>   # against a Postgres dev DB
> ```

---

### 🚀 Production Launch Option A: PM2 (Node Process Manager)
PM2 is the recommended process manager for clustering and launching the Node servers in production.

1. Build both projects:
   ```bash
   npm run build
   ```
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
3. Create a `ecosystem.config.js` file in the root directory:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "regulator-backend",
         script: "dist/main.js",
         cwd: "./backend",
         env: {
           NODE_ENV: "production",
           PORT: 3000,
           DATABASE_URL: "file:./dev.db"
         }
       },
       {
         name: "regulator-frontend",
         script: "node_modules/next/dist/bin/next",
         args: "start -p 3001",
         cwd: "./frontend",
         env: {
           NODE_ENV: "production",
           PORT: 3001,
           NEXT_PUBLIC_API_URL: "http://localhost:3000/api"
         }
       }
     ]
   };
   ```
4. Start the servers with PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

---

### 🐳 Production Launch Option B: Docker Compose
To containerize the application, you can orchestrate multi-tier containers with this simple `docker-compose.yml` config.

Create `docker-compose.yml` in the root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: regulator-db
    environment:
      POSTGRES_USER: esg_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: esg_regulator
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U esg_user -d esg_regulator"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: regulator-backend
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      DB_PROVIDER: "postgresql"
      DATABASE_URL: "postgresql://esg_user:secure_password@postgres:5432/esg_regulator?schema=public"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "npm run db:deploy:pg && npm run db:seed:pg && npm run start:prod"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: regulator-frontend
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      NEXT_PUBLIC_API_URL: "http://backend:3000/api"
    depends_on:
      - backend
```

---

## 🔍 Interactive Live Testing Profiles (Sandbox NIPs)

Use these test numbers inside the search dashboard to observe targeted triggers:

1.  **F-Suite Sp. z o.o. (`5252625123`)**
    *   *Sector*: Software & Cloud hosting (PKD 62.01.Z).
    *   *Scope*: 15 employees, 4.5M PLN turnover.
    *   *Focus*: Universal taxes (CIT-8, JPK_V7M, KSeF), PPK (ZUS), and basic GDPR data protection.
2.  **PolMetal S.A. (`7251892345`)**
    *   *Sector*: Heavy Metal Manufacturing (PKD 24.10.Z).
    *   *Scope*: 320 employees, 185M PLN turnover (Large enterprise).
    *   *Focus*: Heavy EHS triggers (KOBiZE Air Emissions, BDO Waste Registry, F-Gas log, UDT Boiler logs), Whistleblower Protection, and European **CSRD Sustainability Reporting**.
3.  **Restauracja Smak Sp. j. (`1234567890`)**
    *   *Sector*: Restaurant & Gastronomy (PKD 56.10.A).
    *   *Scope*: 4 employees, 820K PLN.
    *   *Focus*: Food safety compliance (Sanepid HACCP approvals), biological kitchen waste handling, and partnership tax.
4.  **TransLogistic Sp. z o.o. (`9012345678`)**
    *   *Sector*: Road Freight Transport & Logistics (PKD 49.41.Z).
    *   *Scope*: 85 employees, 42M PLN.
    *   *Focus*: Road freight licenses (GITD), tachograph log auditing, Sentinel/SENT monitoring, whistleblower policies, and company fleet KOBiZE reports.

---

## ♿ Accessibility Compliance

The design respects **WCAG 2.1 Level AA** standards:
*   **Contrast ratios**: Minimum contrast ratios of 4.5:1 on all dashboard textual cards.
*   **Focus Management**: Custom focus rings for key components, ensuring fully accessible keyboard navigations (`Tab` and standard enter key selects).
*   **ARIA Attributes**: Interactive parts utilize explicit labels and state flags (e.g. `role="tablist"`, `role="tab"`, `aria-selected="..."`).
*   **Semantic Markup**: Uses native semantic tags (`<header>`, `<main>`, `<section>`, `<button>`) to ensure assistive screen-reader compatibility.

---

## 📄 License
This project is licensed under the terms of the private repository license.
