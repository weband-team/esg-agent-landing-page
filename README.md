# ESG Compliance Agent - Bilingual Landing Page & Admin Ledger

A fast, highly secure, and beautifully styled bilingual (Polish/English) landing page and pilot registration platform for the **ESG Compliance Agent**, built with **Next.js 16**, **React 19**, and **SQLite**.

---

## 🚀 Key Features

- **Bilingual Interface**: Seamless, single-click toggle between Polish and English languages across the entire landing page, FAQs, and pricing models.
- **Deposit Registration**: Real-time validation form collecting user contact, company details, industry, reporting standards, and payment currencies.
- **Dynamic Bank Transfer Modal**: After registration, users instantly receive a fully generated, unique reference code (`ESG-QIRE-XXXXXX`) alongside Swift/BIC and localized bank accounts for PLN, EUR, or USD deposit transfers.
- **Interactive ESG Benchmark**: Real-time maturity scoring (Environment, Social, Governance, Supply Chain) based on the proprietary **Relevance Engine v1** with instant report PDF downloads and automatic email dispatch. Fully documented in [docs/benchmark.md](file:///Users/sergiusz/Documents/repo/esg-agent-landing-page/docs/benchmark.md).
- **Secure Admin Panel (`/admin`)**:
  - Secure login interface protected by administrative credentials.
  - Interactive grid metrics reflecting total sign-ups and total verified funding amounts grouped by currencies (PLN, EUR, USD).
  - Search engine (matching name, email, company, and reference code) and status filters.
  - Interactive status dropdown modifiers (transitioning ledger rows between `PENDING`, `PAID`, and `REFUNDED`) directly synced to SQLite.
  - Dynamically compiled CSV export of the currently filtered table rows.
- **Bilingual Legal Pages**: Comprehensive Polityka Prywatności (`/privacy`) and Regulamin (`/terms`) supporting the June 24th, 2026 official launch.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Library**: React 19 (Client/Server components)
- **Styling**: Styled-Components (compiled server-side via `lib/registry.js`)
- **Database**: SQLite3 (stored locally in `deposits.db`)
- **API Guard**: Bearer Token Authorization

---

## 📂 Project Directory Structure

```text
esg-agent-landing-page/
├── app/                        # Next.js App Router root
│   ├── admin/                  # Back-office Admin Panel Page
│   │   └── page.js
│   ├── api/                    # Secure API route handlers
│   │   ├── deposit/            # POST - Creates deposit registrations
│   │   │   └── route.js
│   │   └── deposits/           # GET/PATCH - Secured administrative routes
│   │       └── route.js
│   ├── privacy/                # Polityka Prywatności
│   │   └── page.js
│   ├── terms/                  # Regulamin (Terms & Conditions)
│   │   └── page.js
│   ├── layout.js               # Global application layout and fonts
│   ├── page.js                 # Landing Page client & bilingual copy
│   └── styles.js               # Styled-components global style registry
├── docs/                       # Project and Module Documentation
│   └── benchmark.md            # Detailed ESG Benchmark module docs
├── lib/                        # Design configuration & utilities
│   ├── registry.js             # Styled-components SSR style sheet injection
│   └── theme.js                # Sleek dark-mode aesthetic palette
├── public/                     # Static media and assets
├── database.js                 # SQLite3 Database interface layers
├── deposits.db                 # Persistent local SQLite DB file
├── next.config.js              # Next.js compiler settings
└── package.json                # Project dependencies and script runner
```

---

## 📦 Getting Started

### 1. Installation

Clone the repository and install the project dependencies:

```bash
npm install
```

### 2. Running in Development

Start the development server (configured to automatically compile using Turbopack):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Production Build

To verify compilation, build the optimized static and dynamic page routes:

```bash
npm run build
```

Then, run the node production server:

```bash
npm run start
```

---

## ⚙️ Environment Variables

Configuration is read from a `.env` file in the project root. Copy the provided
template and adjust the values:

```bash
cp .env.example .env
```

| Variable | Scope | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Frontend | `development` | Set to `production` on the server. |
| `PORT` | Frontend | `3000` | Port the Next.js app listens on (`5743` in production, behind Nginx). |
| `NEXT_PUBLIC_REGULATIONS_API_URL` | **Browser** | _empty_ | Base URL the browser uses to reach the Regulations Search backend (SSE + PDF). Leave **empty** in production so the browser uses the same origin and Nginx proxies the requests. Inlined at **build time**. |
| `REGULATIONS_BACKEND_URL` | Frontend server | `http://localhost:3001` | URL the Next.js server uses to call the NestJS backend directly (server-to-server, for emailed PDF reports). |

> ⚠️ **Why this matters.** The Regulations Search page (`/regulations-search`)
> streams progress via Server-Sent Events and downloads PDFs **directly from the
> browser**. If these point at `http://localhost:3001`, they resolve to the
> *visitor's* machine (and are blocked as mixed content on an HTTPS site).
> Leaving `NEXT_PUBLIC_REGULATIONS_API_URL` empty makes the browser call the
> public domain (e.g. `https://esgsyncpro.qirelab.com/api/lookup/...`), which
> Nginx proxies to the backend — see the deployment section below.

---

## 🌐 Deploying to a Remote Server / Hosting

This project is **two services** that must both run on the host:

1. **Frontend** — the Next.js landing page (this repo root), served on **port `5743`**.
2. **Regulations Search backend** — the NestJS API in
   [`regulations-search/backend`](file:///Users/sergiusz/Documents/repo/esg-agent-landing-page/regulations-search/backend),
   served on **port `3001`** (lookup SSE + PDF compiler). See its
   [README](file:///Users/sergiusz/Documents/repo/esg-agent-landing-page/regulations-search/README.md)
   for details. **The `/regulations-search` page is broken without it.**

### 1. Build both services

```bash
# Frontend (project root)
npm install --legacy-peer-deps
npm run build

# Regulations Search backend
cd regulations-search/backend
npm install
npm run db:setup      # generate Prisma client, run migrations, seed SQLite
npm run build
cd ../..
```

### 2. Configure environment

Create the root `.env` (see the table above):

```env
NODE_ENV=production
PORT=5743
NEXT_PUBLIC_REGULATIONS_API_URL=
REGULATIONS_BACKEND_URL=http://localhost:3001
```

The backend reads its own `regulations-search/backend/.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

### 3. Run both services with PM2

```bash
npm install -g pm2

# Frontend on 5743
PORT=5743 pm2 start npm --name esg-agent-landing-page -- run start

# Backend on 3001
cd regulations-search/backend
PORT=3001 pm2 start dist/src/main.js --name esg-regulations-backend
cd ../..

pm2 save && pm2 startup
```

> The bundled GitHub Actions workflow
> ([`.github/workflows/deploy.yml`](file:///Users/sergiusz/Documents/repo/esg-agent-landing-page/.github/workflows/deploy.yml))
> currently builds and (re)starts **only the frontend** on port `5743`. The
> backend must be built and started separately (the PM2 commands above), or
> added to the workflow, otherwise Regulations Search will fail.

### 4. Nginx reverse proxy (HTTPS)

The committed [`nginx.conf`](file:///Users/sergiusz/Documents/repo/esg-agent-landing-page/nginx.conf)
terminates TLS for `esgsyncpro.qirelab.com` and routes:

- `/api/lookup/*` and `/api/pdf/*` → **backend** (`localhost:3001`), with SSE
  buffering disabled for the live progress stream.
- everything else (including the app's own `/api/deposit`, `/api/deposits`,
  `/api/regulations-search/email` routes) → **frontend** (`localhost:5743`).

After editing the config, reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

This keeps everything on one HTTPS origin, so the browser never talks to
`localhost:3001` directly and there is no mixed-content or CORS issue.

---

## 🗄️ Database & Schema

All registrations, benchmark submissions, and regulation check reports are securely recorded locally inside `deposits.db`. The database is self-initializing and auto-migrating on server startup (no manual migrations required).

### `deposits` Table Schema

| Column Field | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Auto-incrementing identifier |
| `name` | `TEXT` | `NOT NULL` | Full Name of registrant |
| `email` | `TEXT` | `NOT NULL` | Contact Email address |
| `phone` | `TEXT` | `NOT NULL` | Contact Phone Number |
| `company` | `TEXT` | `NOT NULL` | Business / Company Name |
| `industry` | `TEXT` | `'Not Specified'` | Company industry sector |
| `standard` | `TEXT` | `'CSRD / VSME'` | Regulatory framework choice |
| `currency` | `TEXT` | `NOT NULL` | Registered currency (`PLN`, `EUR`, `USD`) |
| `amount` | `REAL` | `NOT NULL` | Fully-refundable deposit value (`399` / `99`) |
| `reference` | `TEXT` | `UNIQUE NOT NULL` | Generated Reference string: `ESG-QIRE-XXXXXX` |
| `status` | `TEXT` | `'PENDING'` | Status indicator (`PENDING`, `PAID`, `REFUNDED`) |
| `created_at` | `DATETIME`| `CURRENT_TIMESTAMP` | Registration date and time |

### `benchmarks` Table Schema

| Column Field | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Auto-incrementing identifier |
| `name` | `TEXT` | `NOT NULL` | Representative Full Name |
| `email` | `TEXT` | `NOT NULL` | Business email address |
| `company` | `TEXT` | `NOT NULL` | Registered Company Name |
| `score` | `REAL` | `NOT NULL` | Overall maturity score (0-100) |
| `answers` | `TEXT` | `NOT NULL` | Stringified JSON object of questionnaire responses |
| `created_at` | `DATETIME`| `CURRENT_TIMESTAMP` | Assessment completion date and time |

### `regulation_reports` Table Schema

| Column Field | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Auto-incrementing identifier |
| `name` | `TEXT` | `NOT NULL` | User Full Name |
| `email` | `TEXT` | `NOT NULL` | User email address |
| `company` | `TEXT` | `NOT NULL` | Checked Company Name |
| `nip` | `TEXT` | `NOT NULL` | Polish Tax Identification Number (NIP) |
| `matched_count` | `INTEGER`| `NOT NULL` | Total matched applicable regulations |
| `created_at` | `DATETIME`| `CURRENT_TIMESTAMP` | Check date and time |

---

## 🔒 Administrative Access

To access the back-office management panel, navigate to `/admin` in your web browser.

### Credentials

- **Username**: `admin`
- **Password**: `GmzybwfGjh3`

*Note: In production environments, it is highly recommended to shift these credentials to secure environmental variables (e.g., `process.env.ADMIN_USERNAME` and `process.env.ADMIN_PASSWORD`).*

---

## 🔌 API Reference

### 1. Register a Deposit Intent
- **Endpoint**: `POST /api/deposit`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "name": "Jan Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48 123 456 789",
    "company": "Kowalski ESG Solutions",
    "industry": "Technology",
    "standard": "CSRD VSME",
    "currency": "PLN"
  }
  ```
- **Response**: `200 OK` returning generated database values and swift/bic bank account codes.

---

### 2. Fetch All Deposits
- **Endpoint**: `GET /api/deposits`
- **Authentication**: Requires Bearer Authorization header
- **Headers**:
  ```text
  Authorization: Bearer GmzybwfGjh3
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": 1,
        "name": "Jan Kowalski",
        "email": "jan.kowalski@example.com",
        "phone": "+48 123 456 789",
        "company": "Kowalski ESG Solutions",
        "industry": "Technology",
        "standard": "CSRD VSME",
        "currency": "PLN",
        "amount": 399,
        "reference": "ESG-QIRE-CG6L7W",
        "status": "PAID",
        "created_at": "2026-05-24 00:34:57"
      }
    ]
  }
  ```

---

### 3. Update Deposit Status
- **Endpoint**: `PATCH /api/deposits`
- **Authentication**: Requires Bearer Authorization header
- **Headers**:
  ```text
  Authorization: Bearer GmzybwfGjh3
  ```
- **Request Body**:
  ```json
  {
    "reference": "ESG-QIRE-CG6L7W",
    "status": "PAID"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "reference": "ESG-QIRE-CG6L7W",
      "status": "PAID",
      "changes": 1
    }
  }
  ```
