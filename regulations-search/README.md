# 🇵🇱 Regulator: Polish Company ESG & Legal Compliance Checker

**Regulator** is a premium, enterprise-grade RegTech (Regulatory Technology) compliance platform designed to help Polish companies instantly identify their national and European legal, ESG (Environmental, Social, and Governance), and operational obligations.

---

## 💼 Business Perspective & Value Proposition

In the modern economic landscape, regulatory compliance is one of the most significant operational challenges for businesses, particularly Small and Medium Enterprises (SMEs) and growing enterprises.

### The Problem
* **Dense Regulatory Web**: Companies operating in Poland must navigate a complex, overlapping matrix of European directives (e.g., **CSRD**, **CBAM**, **GDPR**, **EU Taxonomy**) and national statutes (e.g., Polish environmental registry **BDO**, air emissions reporting **KOBiZE**, mandatory employee capital plans **PPK**, and upcoming electronic invoicing **KSeF**).
* **Catastrophic Financial Risks**: Unintentional non-compliance carries severe legal and financial penalties, including fines up to **4% of global annual turnover** for GDPR violations, or millions of PLN/EUR for missing environmental filings and tax ledger audits.
* **Prohibitive Advisory Costs**: Retaining specialized compliance legal firms or ESG audit consultants to perform manual regulatory mapping costs tens of thousands of PLN/EUR—making proactive compliance financially prohibitive for most SMEs.

### The Solution: Automated RegTech
The **Regulations Search** module disrupts this model by providing a self-serve, automated matching engine that does the heavy lifting in seconds. By inputting a Polish **NIP (Tax Identification Number)**, the platform:
1. **Performs Real-Time Corporate Profiling**: Validates and queries corporate record databases to extract headcount, annual revenue, balance sheet assets, legal forms, and PKD industry codes.
2. **Runs a 7-Step Matching Engine**: Maps the company's profile against an active, codified database of national and European environmental, social, labor, and fiscal regulations.
3. **Instantly Generates a Personalized Compliance Roadmap**: Categorizes exact duties, outlines specific filing thresholds, defines key deadlines, lists responsible supervisory authorities (e.g., KAS, GIODO/UODO, GIOŚ), and details the required audit evidence.
4. **Outputs Premium Audit Reports**: Generates high-fidelity, text-selectable PDF compliance checklists that can be printed or emailed instantly.

### Business & Compliance Benefits
* **🚀 Zero-to-One Compliance Clarity**: Replaces weeks of manual regulatory research with an interactive, 3-second automated checklist tailored to the company's size and industry.
* **💰 Drastic Cost Savings**: Empowers businesses to audit themselves before engaging consultants, eliminating initial consultation costs and reducing ongoing compliance overhead.
* **🛡️ Proactive Risk Mitigation**: Identifies compliance gaps before they trigger official inspections, mitigating the risk of devastating regulatory fines and operational suspensions.
* **🏆 Commercial & Procurement Edge**: Allows companies to generate and present robust compliance checklists during enterprise procurement bids, bank financing requests, and investor due diligence.
* **📅 Actionable Operational Calendar**: Lists precise filing thresholds and deadlines so internal HR, finance, and operations teams know exactly what to report and when.

---

## 🏗️ Integrated Architecture

The application is split into two co-dependent parts running on your development or production environment:

1. **Frontend UI (Next.js)**: Integrated directly into the main ESG Landing Page project under `/app/regulations-search/page.tsx`. It runs on port **3000** (default) and provides the retro-themed RegTech dashboard, real-time Server-Sent Events (SSE) stepper, sizing manual overrides, and PDF downloader.
2. **Backend API (NestJS)**: A standalone NestJS service located under `/regulations-search/backend`. It runs on port **3001** and contains the live Ministry of Finance KAS White List client, the 7-step matching engine, and the dynamic PDF document compiler.
3. **Alternative Standalone Frontend (Next.js)**: Located under `/regulations-search/frontend`. It is an independent Next.js workspace that can be run on port **3002** if developers prefer to host or test the Regulations Search module entirely separate from the main landing page.

---

## 🛠️ Local Development Setup

To run the Regulations Search tool locally on your computer, follow these step-by-step instructions.

### Prerequisites
* **Node.js**: `v18.x` or higher (tested on `v20.x`)
* **npm**: `v9.x` or higher

### 1. Install Dependencies
Install dependencies for both the main landing page and the `regulations-search` monorepo workspaces:
```bash
# Install root dependencies (Landing Page & Integrated Frontend)
npm install

# Install regulations-search monorepo workspace dependencies
cd regulations-search
npm install
cd ..
```

### 2. Configure Environment Variables
Verify or create a `.env` file inside the `regulations-search/backend` directory:
```env
# Path: regulations-search/backend/.env
DATABASE_URL="file:./dev.db"
PORT=3001
```

### 3. Initialize & Seed the Database (SQLite)
The backend uses **Prisma ORM** to connect to an SQLite database (`dev.db`). This database must be initialized, migrated, and seeded with the regulations catalogue and test profiles.

You can do this in one single step by running the setup script inside the backend directory:
```bash
# Navigate to the backend directory
cd regulations-search/backend

# Generate Prisma Client, run migrations, and seed the SQLite database
npm run db:setup
```
This command runs:
* `prisma generate` to compile high-performance TypeScript query typings.
* `prisma migrate deploy` to create the SQLite database file (`dev.db`) and apply schema migrations.
* `prisma db seed` to parse JSON catalogs and populate the database with **42 core legal regulations** and **4 preconfigured sandbox companies**.

*To return to the workspace root:*
```bash
cd ../..
```

### 4. Start Development Servers
To run the system locally, you must start both the frontend Next.js server and the backend NestJS service.

#### Run Frontend (Port 3000)
In the root workspace directory, run:
```bash
npm run dev
```
The Next.js landing page and integrated search tool will be available at: [http://localhost:3000/regulations-search](http://localhost:3000/regulations-search)

#### Run Backend (Port 3001)
In a separate terminal window, run:
```bash
cd regulations-search/backend
npm run start:dev
```
The NestJS API microservice will start on port **3001** and watch for file changes.

---

## 🗄️ Database Migrations

Prisma serves as the data mapping layer. The schema is stored in `regulations-search/backend/prisma/schema.prisma`.

### Applying Changes to SQLite Schema
If you modify the database models in `schema.prisma` during development, perform the following commands to synchronize the SQLite database:
```bash
cd regulations-search/backend

# Create a new migration file and apply it to dev.db
npx prisma migrate dev --name <describe-your-change>

# Regenerate the Prisma Client
npx prisma generate
```

### Production Migrations (PostgreSQL Example)
For production environments, **PostgreSQL** is recommended. The backend includes automated scripts to derive a PostgreSQL-compatible schema and deploy it.

1. Configure your production environment variables:
   ```env
   DB_PROVIDER="postgresql"
   DATABASE_URL="postgresql://db_user:secure_pass@db_host:5432/db_name?schema=public"
   ```
2. Build, migrate, and seed the PostgreSQL database:
   ```bash
   cd regulations-search/backend
   
   # Setup PostgreSQL (Compiles PG schema, applies migrations, and seeds catalog)
   npm run db:setup:pg
   ```
   *Under the hood, this compiles `prisma/schema.postgres.prisma` from your SQLite model source, generates the pg Prisma Client, executes the deployment, and runs the seed script.*

---

## 🏁 Production Server Deployment

To run this system in a production or staging environment, use one of the following setups.

### Environment Variable Requirements
Always configure these environment variables on your production hosting server:

| Environment Variable | Description | Default Local Value | Example Production Value |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | running process environment context | `development` | `production` |
| `PORT` | NestJS backend server port | `3001` | `3001` (or customized) |
| `DATABASE_URL` | Prisma DB connection endpoint | `file:./dev.db` | `postgresql://user:pass@host:5432/esg` |
| `NEXT_PUBLIC_API_URL` | Endpoint where frontend reaches the API | `http://localhost:3001/api` | `https://api.yourdomain.com/api` |

---

### Deploy Option A: PM2 (Process Manager)
PM2 is recommended to manage, cluster, and keep both services alive on a Linux or macOS virtual server (VPS).

1. Build both projects:
   ```bash
   # From root workspace directory, build Next.js frontend
   npm run build
   
   # Build NestJS backend
   cd regulations-search/backend
   npm run build
   cd ../..
   ```
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
3. Create a process management file `ecosystem.config.js` in your root directory:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "esg-landing-frontend",
         script: "node_modules/next/dist/bin/next",
         args: "start -p 3000",
         cwd: "./",
         env: {
           NODE_ENV: "production",
           PORT: 3000
         }
       },
       {
         name: "esg-regulations-backend",
         script: "dist/src/main.js",
         cwd: "./regulations-search/backend",
         env: {
           NODE_ENV: "production",
           PORT: 3001,
           DATABASE_URL: "file:./dev.db" // or PostgreSQL connection URL
         }
       }
     ]
   };
   ```
4. Setup DB & Launch via PM2:
   ```bash
   # Deploy migrations and seed SQLite (or pg)
   cd regulations-search/backend
   npm run db:setup
   cd ../..

   # Start both services
   pm2 start ecosystem.config.js
   ```

---

### Deploy Option B: Reverse Proxy Configuration (Nginx)
To expose both ports securely over standard SSL (port 443), set up Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name compliance.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name compliance.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/compliance.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/compliance.yourdomain.com/privkey.pem;

    # Frontend Route (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API & SSE Route (NestJS)
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Required settings for Server-Sent Events (SSE) streaming support
        proxy_set_header X-Accel-Buffering no;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

---

### Deploy Option C: Docker Compose
For containerized microservice management, create a `docker-compose.yml` file in the repository root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: esg-postgres
    environment:
      POSTGRES_USER: esg_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: esg_regulations
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U esg_user -d esg_regulations"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./regulations-search/backend
      dockerfile: Dockerfile
    container_name: esg-backend
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      DB_PROVIDER: "postgresql"
      DATABASE_URL: "postgresql://esg_user:secure_password@postgres:5432/esg_regulations?schema=public"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "npm run db:setup:pg && npm run start:prod"

  frontend:
    build:
      context: ./
      dockerfile: Dockerfile
    container_name: esg-frontend
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NEXT_PUBLIC_API_URL: "http://backend:3001/api"
    depends_on:
      - backend
```

---

## 🔍 Interactive Sandbox NIP Profiles

To test the 7-step matching engine in action without invoking live APIs, use these preconfigured sandbox Polish tax identification numbers (NIPs) in the search input:

1. **F-Suite Sp. z o.o. (`5252625123`)**
   * **Profile**: 15 employees, 4.5M PLN annual revenue (Micro/Small).
   * **Sector**: IT & Cloud Hosting (PKD 62.01.Z).
   * **Focal Points**: Base corporate taxes (CIT-8, JPK_V7M, KSeF), Employee Capital Plans (PPK), and basic GDPR data protection.
2. **PolMetal S.A. (`7251892345`)**
   * **Profile**: 320 employees, 185M PLN annual revenue (Large Enterprise).
   * **Sector**: Heavy Metal Manufacturing (PKD 24.10.Z).
   * **Focal Points**: High environmental impacts (**KOBiZE** Air Emissions, **BDO** Waste Registry, **F-Gas** log, **UDT** Boiler logs), European **CSRD Sustainability Reporting**, and Whistleblower Protection guidelines.
3. **Restauracja Smak Sp. j. (`1234567890`)**
   * **Profile**: 4 employees, 820K PLN annual revenue (Micro-business).
   * **Sector**: Gastronomy & Catering (PKD 56.10.A).
   * **Focal Points**: Food safety standards (**Sanepid HACCP** certifications), bio-waste handling, and simplified partnership taxation.
4. **TransLogistic Sp. z o.o. (`9012345678`)**
   * **Profile**: 85 employees, 42M PLN annual revenue (Medium Enterprise).
   * **Sector**: Road Freight Transport & Logistics (PKD 49.41.Z).
   * **Focal Points**: Transport licenses (GITD), tachograph log compliance, Sentinel (**SENT**) transit tracking, whistleblower policies, and corporate vehicle fleet KOBiZE reports.

---

## ♿ Accessibility & UX Compliance

The user interface of the Regulations Search module adheres strictly to **WCAG 2.1 Level AA** standards:
* **Enhanced Contrast**: Achieves a minimum contrast ratio of 4.5:1 across all background cards and typography.
* **Full Keyboard Accessibility**: All inputs, interactive steppers, and sizing manual override panels are navigable using standard keyboard (`Tab`, `Shift+Tab`, `Space`, `Enter`).
* **ARIA Integrity**: Uses appropriate ARIA markup roles (e.g., `role="status"`, `aria-expanded`, `aria-live="polite"`) to facilitate screen readers.
* **Semantic HTML**: Built with native HTML5 elements (`<main>`, `<header>`, `<section>`, `<article>`) to support accessibility trees.

---

## 📄 License
This project is licensed under the terms of the private repository license.
