\# RazorRecovery.OS: Autonomous Payment Failure Diagnostic \& Guardrailed Recovery Agent



An intelligent, dual-layer autonomous revenue recovery runtime designed to salvage dropped e-commerce and SaaS checkouts without unconstrained financial authority. Powered by FastAPI, React/Vite, deterministic guardrail policies, and live Razorpay Payment APIs.



\[!\[Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge\&logo=vercel)](https://razorpay-recovery-ai.vercel.app)

\[!\[API Documentation](https://img.shields.io/badge/Swagger%20Docs-Render-46E3B7?style=for-the-badge\&logo=render\&logoColor=black)](https://razorpay-recovery-ai.onrender.com/docs)

\[!\[License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)



\---



\## Live Cloud Deployments



\* \*\*Frontend Dashboard\*\*: \[https://razorpay-recovery-ai.vercel.app](https://razorpay-recovery-ai.vercel.app)

\* \*\*Backend API \& Swagger Docs\*\*: \[https://razorpay-recovery-ai.onrender.com/docs](https://razorpay-recovery-ai.onrender.com/docs)



\---



\## Core Problem Statement



Merchants lose 10% to 15% of top-line Gross Merchandise Value (GMV) to silent payment drops, transient network timeouts, and authentication drop-offs. Traditional recovery workflows either:

1\. \*\*Blindly auto-retry\*\*, triggering merchant throttling, gateway penalties, and banking fraud flags.

2\. \*\*Send passive notifications\*\*, yielding low salvage rates and prolonged recovery lag.



\*\*RazorRecovery.OS\*\* decouples probabilistic diagnostic inference from financial execution authority, ensuring zero unauthorized payment link generation while recovering at-risk capital autonomously.



\---



\## System Architecture
\[ Failed Checkout Event ]

│

▼

┌──────────────────────────────┐

│   01. AI Diagnostic Engine   │  <-- Classifies failure cause (Network, 3DS, Drops)

│   (Probabilistic Inference)  │      Scores salvage probability (0% - 100%)

└──────────────┬───────────────┘

│

▼

┌──────────────────────────────┐

│  02. Policy Guardrails       │  <-- Hard retry bounds (Max: 2)

│   (Deterministic Authority)  │      Transaction value ceilings (INR limits)

└──────────────┬───────────────┘

│

┌────────┴────────┐

\[ Passed Policy ]  \[ Breached Bounds ]

│                 │

│                 ▼

│        ┌─────────────────────────┐

│        │  Automated Escalation   │  <-- Quarantined for human intervention

│        └─────────────────────────┘

▼

┌──────────────────────────────┐

│ 03. Razorpay API Dispatcher  │  <-- Generates dynamic Test Payment Links (rzp.io)

└──────────────┬───────────────┘

│

▼

┌──────────────────────────────┐

│ 04. Immutable Audit \& Ledger │  <-- Real-time KPI yield \& salvage rate analytics

└──────────────────────────────┘





\---



\## Key Features



\* \*\*AI Diagnostic Inference Engine\*\*: Analyzes failure signals (e.g., `card\_authentication\_failed`, `upi\_temporary\_failure`, `user\_abandoned`), detects transaction patterns, and assigns empirical recovery probability scores.

\* \*\*Deterministic Guardrail Policies\*\*: Financial actions require validation through non-negotiable business constraints. Unsafe actions (e.g., attempt limits exceeded, excessive value) trigger automatic isolation and policy blocks.

\* \*\*Live Razorpay API Integration\*\*: Directly talks to Razorpay's `/v1/payment\_links` endpoint to generate authentic hosted payment checkouts carrying matching amounts and transaction IDs.

\* \*\*Real-time Metric Tracking\*\*: Live calculating dashboard monitoring Capital at Risk, Recovered Revenue, Salvage Efficiency (%), and Guardrail Trip Invocations.

\* \*\*Immutable Audit Trail\*\*: Append-only event logging tracking every phase transition from detection to recovery settlement.



\---



\## Repository Structure



Razorpay\_recovery\_AI/

├── backend/

│   ├── models/                 # SQLAlchemy schemas \& Pydantic validation

│   ├── routers/                # API route definitions (/api/recovery, /api/dashboard)

│   ├── services/

│   │   ├── ai\_service.py       # Diagnostic inference \& root-cause classifier

│   │   ├── policy\_service.py   # Deterministic boundary check \& safety thresholds

│   │   ├── razorpay\_service.py # Official Razorpay API integration client

│   │   └── recovery\_service.py # Orchestrator linking state transitions

│   ├── .python-version         # Pinned Python 3.11 runtime definition

│   ├── config.py               # Pydantic environment configuration

│   ├── database.py             # Database engine \& session maker

│   ├── main.py                 # FastAPI application entry \& CORS middleware

│   └── requirements.txt        # Production dependency specifications

├── frontend/

│   ├── public/                 # Favicons \& static assets

│   ├── src/

│   │   ├── components/         # Reusable UI components (Stream, Stepper, Logs, Rail)

│   │   ├── App.jsx             # Main interactive dashboard container

│   │   ├── index.css           # Tailwind / Custom dark-mode terminal styles

│   │   └── main.jsx            # React root mount point

│   ├── index.html              # HTML shell

│   ├── package.json            # Node dependencies and build scripts

│   └── vite.config.js          # Vite build configuration

└── README.md                   # Project documentation \& operational manual





\---



\## Local Setup \& Installation



\### Prerequisites

\* Python 3.10 or 3.11

\* Node.js 18+ and npm

\* Razorpay Test Mode API credentials



\### 1. Backend Configuration



```bash

cd backend

python -m venv venv



\# Windows

venv\\Scripts\\activate



\# macOS / Linux

source venv/bin/activate



pip install -r requirements.txt

Create a .env file in backend/:



Code snippet

RAZORPAY\_KEY\_ID=rzp\_test\_YOUR\_KEY\_ID

RAZORPAY\_KEY\_SECRET=YOUR\_KEY\_SECRET

DATABASE\_URL=sqlite:///./recovery.db

Start the FastAPI server:



Bash

uvicorn main:app --reload --port 8000

Backend will be active at http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs).



2\. Frontend Configuration

Open a new terminal:



Bash

cd frontend

npm install

Create a .env file in frontend/:



Code snippet

VITE\_API\_BASE\_URL=\[http://127.0.0.1:8000](http://127.0.0.1:8000)

Start the development server:



Bash

npm run dev

Open http://localhost:5173/ in your browser.



Tech Stack

Backend: Python, FastAPI, SQLAlchemy, SQLite, Pydantic, Requests



Frontend: React, Vite, Lucide Icons, TailwindCSS



Gateway: Razorpay Payment Links API (v1)



Cloud Infrastructure: Render (FastAPI Web Service), Vercel (Edge SPA Hosting)

