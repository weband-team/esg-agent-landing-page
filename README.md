# ESG Compliance Agent - Bilingual Landing Page & Admin Ledger

A fast, highly secure, and beautifully styled bilingual (Polish/English) landing page and pilot registration platform for the **ESG Compliance Agent**, built with **Next.js 16**, **React 19**, and **SQLite**.

---

## 🚀 Key Features

- **Bilingual Interface**: Seamless, single-click toggle between Polish and English languages across the entire landing page, FAQs, and pricing models.
- **Deposit Registration**: Real-time validation form collecting user contact, company details, industry, reporting standards, and payment currencies.
- **Dynamic Bank Transfer Modal**: After registration, users instantly receive a fully generated, unique reference code (`ESG-QIRE-XXXXXX`) alongside Swift/BIC and localized bank accounts for PLN, EUR, or USD deposit transfers.
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

## 🗄️ Database & Schema

All registrations are securely recorded locally inside `deposits.db`.

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
