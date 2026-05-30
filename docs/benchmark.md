# ESG Benchmark - Developer & Business Documentation

The **ESG Benchmark (Maturity Assessment)** is a high-fidelity, interactive, and bilingual (Polish/English) self-assessment tool designed for enterprises to evaluate their sustainability maturity. It runs as an integral module within the **ESG Compliance Agent Next.js application** (Port 3000) and leverages a sophisticated client-side and server-side calculation engine.

---

## 📊 Business Value Perspective

From a business, marketing, and client-onboarding perspective, the ESG Benchmark serves as a critical strategic asset:

1. **High-Value Lead Magnet**: Instead of requiring a lengthy, expensive manual audit, companies can complete a 5-minute interactive questionnaire to instantly understand their current standing.
2. **Instant Gratification & Value Delivery**: The system instantly generates a professional, publication-quality **ESG Assessment Report (PDF)**. This report can be downloaded directly in the browser and is simultaneously dispatched via email.
3. **Intelligent Risk Prioritization**: Rather than presenting an overwhelming list of compliance errors, the tool leverages the proprietary **Relevance Engine v1** to compute a **TOP 3 Risk Areas** action plan, categorized by concrete horizons:
   - 🔴 **Immediate Actions (30 days)**: For critical, high-impact gaps.
   - 🟠 **Tactical Actions (90 days)**: For moderate risk exposures.
   - 🟡 **Strategic Actions (180 days)**: For long-term maturity alignment.
4. **Industry-Specific Personalization**: The scoring and recommendations are tailored across **8 key industries** (Construction, Energy, Finance, IT, Logistics, Production, Retail, Services), making the assessment highly precise and authoritative for the prospect's sector.
5. **Gateway to ESG Sync Pro**: The generated report naturally acts as a diagnostic bridge, demonstrating compliance gaps (e.g., CSRD VSME, ESRS, EUDR) that are solved by upgrading to the full enterprise platform, **ESG Sync Pro**.

---

## ⚙️ Technical Architecture & Scoring System

The module consists of three interconnected layers:
1. **Interactive Client-Side Questionnaire (`app/benchmark/page.js`)**: Collects responses, tracks state progress, and handles PDF compilation.
2. **Relevance Engine (`window.ESGScoring` / Client-Side Scripting)**: Implements mathematical weighting:
   - **Baseline Score**: Standard impact value of risk areas (0-100).
   - **Relevance Index ($R \in [0, 1]$)**: Contextual applicability of questions based on company profile and answers.
   - **Completeness Index ($C \in [0, 1]$)**: Quantity and verifiability of available evidence.
   - **Maturity Score ($MS$)**:
     $$MS = \text{Baseline} \times R \times C$$
   - **Expected Risk-Reduction Speed ($ERRS$)**:
     $$ERRS = MS \times (1 - \text{current\_maturity}) \times \text{ease\_of\_implementation}$$
     *The 3 areas with the highest ERRS scores are promoted to the TOP 3 priority list.*
3. **Secure API Router (`app/api/benchmark/email/route.js`)**: Stores submission logs locally and handles PDF dispatch via a secure email forwarding proxy.

---

## 🗄️ Database & Schema (Self-Migrating)

The application uses a local-first **SQLite3** database stored at the root: `deposits.db`.

### 🛡️ No Manual Migrations Required
The database adapter layer (`database.js`) is designed using **plug-and-play auto-initialization**. 
When the Next.js server starts, it initializes the database connection and automatically serializes `CREATE TABLE IF NOT EXISTS` statements. **No database migrations need to be run manually.**

```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    score REAL NOT NULL,
    answers TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### `benchmarks` Table Schema

| Column Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique submission identifier |
| `name` | `TEXT` | `NOT NULL` | Full Name of the representative |
| `email` | `TEXT` | `NOT NULL` | Corporate contact email |
| `company` | `TEXT` | `NOT NULL` | Legal name of the business entity |
| `score` | `REAL` | `NOT NULL` | Aggregated overall maturity percentage (0-100) |
| `answers` | `TEXT` | `NOT NULL` | Stringified JSON object of all raw questionnaire answers |
| `created_at` | `DATETIME`| `DEFAULT CURRENT_TIMESTAMP` | Date and time of assessment completion |

---

## 🚀 How to Launch Locally

To run the ESG Benchmark module locally on your development machine:

### 1. Prerequisite Dependencies
Ensure you have Node.js (v18+) installed. Install root node modules:
```bash
npm install
```

### 2. Run the Next.js Application
Start the development server with Hot Module Reloading (HMR) enabled:
```bash
npm run dev
```
Open [http://localhost:3000/benchmark](http://localhost:3000/benchmark) in your browser.

### 3. Verify Database Creation
Upon the first startup, SQLite will automatically create `deposits.db` in the root folder and populate the `benchmarks`, `deposits`, and `regulation_reports` tables.

---

## 🌐 Production Server Launch Guide

When deploying the Benchmark module to a production server (such as Ubuntu, Debian, or macOS Server):

### 1. Build Production Bundle
Next.js requires an optimized production build before deployment. Run:
```bash
npm run build
```
This compiles the application, runs TypeScript checks, and outputs optimized server-side rendering bundles.

### 2. Run the Production Node Server
Start the production server:
```bash
npm run start
```
*By default, the server runs on Port 3000.*

### 3. Setup PM2 Process Manager (Highly Recommended)
To ensure the application runs continuously in the background and restarts automatically on system reboots or crashes, use PM2:
```bash
# Install PM2 globally
npm install -g pm2

# Start Next.js server with PM2
pm2 start npm --name "esg-landing-page" -- run start

# Save PM2 state and enable startup hook
pm2 save
pm2 startup
```

### 4. Nginx Reverse Proxy Setup
Configure Nginx as a reverse proxy to route public port `80` (HTTP) and `443` (HTTPS with SSL) traffic to the Next.js service on port `3000`.

Create or edit your site config (e.g., `/etc/nginx/sites-available/esg-agent.conf`):
```nginx
server {
    listen 80;
    server_name esgsyncpro.qirelab.com;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name esgsyncpro.qirelab.com;

    ssl_certificate /etc/letsencrypt/live/esgsyncpro.qirelab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/esgsyncpro.qirelab.com/privkey.pem;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/esg-agent.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✉️ Email Dispatch Service (Google Apps Script)

To send the generated reports, Next.js delegates email delivery with attached PDFs to a serverless **Google Apps Script** endpoint.

### 🔗 Integration Endpoint
The Next.js API route (`app/api/benchmark/email/route.js`) sends `POST` requests formatted as URL-encoded form data to:
`https://script.google.com/macros/s/AKfycbzUFrWH0Q2N7OiSzsy14zQQ2cAt_XDXMScKBe7SqPrDs2NvkQ8A-xYmEsgtLymOAhGh/exec`

### 📤 Form Fields Transmitted:
- `action`: `'email_pdf'`
- `email`: Contact email address (trimmed).
- `pdfBase64`: Complete base64 string of the PDF document.
- `lang`: Language code (`pl` or `en`).
- `filename`: String title of the attached PDF (e.g., `ESG_Assessment_1717012345678.pdf`).

---

## 🔧 Troubleshooting & QA

### 🛑 Empty PDF or Blank Assessment Cards
* **Cause**: Client-side relevance computations were disconnected from the PDF compiler.
* **Solution**: Ensure `computeScoreData()` inside `app/benchmark/page.js` correctly calls `window.ESGScoring.computeRelevance` with complete industry and answering parameters before generating the PDF object.

### 🛑 "TypeError: ContentService...setHeaders" inside API Route Logs
* **Cause**: The Google Apps Script tried to use a `.setHeaders()` method on a `TextOutput` object, which is unsupported.
* **Solution**: Open the Google Script Editor for your macro, navigate to line 79 in **Kod.gs**, and remove the `.setHeaders(...)` call completely.
