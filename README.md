# RazorRecovery.OS: Autonomous Payment Failure Diagnostic & Guardrailed Recovery Agent

RazorRecovery.OS is an intelligent, dual-layer autonomous revenue recovery engine built to intercept, diagnose, and recover failed or abandoned transactions across digital checkouts. By strictly decoupling probabilistic AI diagnostics from deterministic execution guardrails, the system eliminates unconstrained agent actions while generating authentic recovery payment links via the Razorpay API.

---

## Live Cloud Deployments

* **Frontend Dashboard (Production)**: https://razorpay-recovery-ai.vercel.app
* **Backend API & Swagger Documentation**: https://razorpay-recovery-ai.onrender.com/docs
* **API Base URL**: https://razorpay-recovery-ai.onrender.com

*(Note: Free-tier instances on Render enter a sleep state after periods of inactivity. Please allow 30 to 50 seconds for the initial cold start when accessing backend routes directly).*

---

## The Problem: Revenue Leakage in Digital Payments

Merchants operating at scale lose between 10% and 15% of top-line Gross Merchandise Value (GMV) to failed, timed-out, or abandoned checkout interactions.

Current remediation patterns suffer from structural flaws:
1. **Blind Auto-Retries**: Automated retry scripts repeatedly hit customer payment rails without understanding root causes, triggering merchant velocity penalties, gateway blacklisting, and customer bank fraud alerts.
2. **Passive Email Notifications**: Abandoned cart or payment link notifications suffer from low conversion rates, long latency delays, and zero context regarding why the payment originally failed.
3. **Unchecked Autonomous Agents**: Giving Large Language Models direct, unchecked authority to initiate financial movements or retries introduces unacceptable operational and financial risk.

---

## The Solution: Dual-Layer Architecture

RazorRecovery.OS separates **Intelligence** from **Authority**:

1. **Layer 1 — Probabilistic AI Diagnostic Engine**:
   * Inspects transaction metadata, customer velocity history, and raw payment error payloads (`card_authentication_failed`, `upi_temporary_failure`, `user_abandoned`, `insufficient_funds`).
   * Classifies root causes into distinct failure taxonomies (Transient Network, Authentication Dropout, Behavioral Abandonment, Terminal Liquidity).
   * Calculates an empirical **Estimated Salvage Probability** score (0% to 100%) and selects a recovery tactic.

2. **Layer 2 — Deterministic Policy Guardrails**:
   * Evaluates the recommended action against strict business constraints before any external call is authorized.
   * **Retry Cap**: Enforces a strict maximum of 2 recovery attempts per transaction ID.
   * **Capital Ceilings**: Flags and isolates single transactions exceeding defined transaction limits.
   * **Escalation Mechanism**: If a transaction breaches safety policies, the engine blocks automatic execution and marks the transaction as `ESCALATED` for human intervention.

3. **Layer 3 — Live Gateway Execution**:
   * Once validated by policy checks, the service dispatches an authenticated HTTP POST request to the Razorpay API endpoint (`https://api.razorpay.com/v1/payment_links`).
   * Generates a genuine hosted checkout link (`rzp.io`) linked with exact rupee amounts, dynamic customer metadata, and reconciliation notes.

4. **Layer 4 — Accounting Ledger & Real-Time KPIs**:
   * Records every state change in an immutable, append-only transaction audit log.
   * Tracks real-time top-rail financial performance metrics:
     * **Capital at Risk**: Total value of dropped checkouts currently pending intervention.
     * **Recovered Revenue**: Total value converted through successful recovery workflows.
     * **Salvage Efficiency (%)**: Percentage ratio of recovered revenue against total targeted dropped volume.
     * **Guardrail Invocations**: Counter tracking whenever deterministic policies prevent an unauthorized action.

---

## State Transition Lifecycle

Transactions proceed through a deterministic finite-state machine:

* **FAILED**: Transaction error detected and queued into the transaction stream.
* **AI DIAGNOSTIC**: Root cause classified, recovery vector decided, salvage confidence assigned.
* **POLICY VERIFIED**: Guardrail boundaries validated (or blocked and marked as `ESCALATED`).
* **RECOVERING**: Live Razorpay payment link generated; invoice dispatched to customer.
* **RECOVERED / EXPIRED**: Customer completes payment via the gateway link, settling capital into recovered revenue.

---

## Tech Stack & Tooling

* **Backend**: Python 3.11, FastAPI, Uvicorn ASGI, SQLite, SQLAlchemy 2.0, Requests, Pydantic v2
* **Frontend**: React 18, Vite, TailwindCSS, Lucide React
* **Integrations**: Razorpay Payment Links API (v1)
* **Cloud Infrastructure**: Render (Backend Web Service), Vercel (Edge SPA Hosting)

---

## Project Repository Structure

Razorpay_recovery_AI/
├── backend/
│   ├── models/
│   │   └── transaction.py          # SQLAlchemy models & Pydantic validation schemas
│   ├── routers/
│   │   ├── transactions.py         # Transaction stream endpoints
│   │   └── recovery.py             # Diagnostic & execution endpoints
│   ├── services/
│   │   ├── ai_service.py           # Probabilistic diagnostic & heuristic inference engine
│   │   ├── policy_service.py       # Deterministic guardrails & threshold enforcement
│   │   ├── razorpay_service.py     # Live Razorpay REST client (Payment Links generation)
│   │   └── recovery_service.py     # End-to-end lifecycle orchestrator
│   ├── .python-version             # Pinned Python 3.11 runtime specification
│   ├── config.py                   # Environment configuration & credential management
│   ├── database.py                 # SQLite database engine initialization
│   ├── main.py                     # FastAPI application setup & CORS configuration
│   └── requirements.txt            # Pinned backend dependencies
├── frontend/
│   ├── public/                     # Static icons and assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # System status & batch simulation trigger
│   │   │   ├── MetricsRail.jsx     # Real-time financial KPI summary cards
│   │   │   ├── TransactionList.jsx # Transaction stream with status filtering
│   │   │   ├── Stepper.jsx         # 4-stage visual execution progress stepper
│   │   │   ├── DiagnosticCard.jsx  # AI root cause & salvage probability card
│   │   │   ├── GuardrailCard.jsx   # Deterministic guardrail approval & link trigger
│   │   │   └── AuditLog.jsx        # Monospaced immutable ledger log
│   │   ├── App.jsx                 # Central state manager & layout shell
│   │   ├── index.css               # Global CSS & theme styles
│   │   └── main.jsx                # React root mount
│   ├── index.html                  # HTML entrypoint
│   ├── package.json                # Frontend scripts and dependencies
│   └── vite.config.js              # Vite server & proxy configuration
└── README.md                       # Complete project documentation

---

## Local Development & Setup Guide

### 1. Prerequisites
* Python 3.10 or 3.11 installed
* Node.js 18+ and npm installed
* A Razorpay account with Test Mode Key ID and Key Secret

---

### 2. Backend Setup

cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

Create an environment file at backend/.env:
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

Start the FastAPI application:
uvicorn main:app --reload --port 8000

The API will be available at http://127.0.0.1:8000 (Interactive docs: http://127.0.0.1:8000/docs).

---

### 3. Frontend Setup

cd frontend
npm install

Create an environment file at frontend/.env:
VITE_API_BASE_URL=http://localhost:8000

Start the development server:
npm run dev

Open http://localhost:5173 in your browser.

---

## Interactive Verification Walkthrough

1. **Populate Pipeline**: Click **RUN BATCH SIMULATION (50 TXNS)** in the top right to generate a diverse stream of transaction failures.
2. **Run AI Diagnostics**: Select an unhandled `FAILED` transaction from the left-hand stream. Click **Invoke Diagnostic** to view the classified root cause and salvage probability score.
3. **Evaluate Guardrails**: Click **Evaluate & Dispatch**. The deterministic policy engine checks retry boundaries.
4. **Trigger Payment**: Click **Open Razorpay Payment Link** to open the live, hosted Razorpay test checkout page pre-filled with the exact transaction value.
5. **Reconcile Settlement**: Click **Mark Paid** on the dashboard to observe the live updates to Recovered Revenue, Salvage Efficiency, and the append-only Immutable Audit Log.