<<<<<<< HEAD
﻿# NEWS24 NEWS NETWORK
### Full-Stack Digital News Publishing & Subscription Platform

A complete, responsive, database-driven news publishing platform and 24/7 television broadcast network web application built with **Node.js, Express.js, React, Tailwind CSS, PostgreSQL, Prisma, and Razorpay Subscriptions (Test Mode)**.

---

## ðŸ“º Unique 24/7 TV News Channel Aesthetic
- **Broadcasting Color Palette**: Deep navy (`#040812`, `#0a1021`), black, crisp white, and bold broadcast red (`#e50914`).
- **Live On-Air Top Bar**: Real-time IST/UTC broadcast clock, Live SENSEX, NIFTY 50, NASDAQ, Brent Crude, Gold financial tickers, and network status.
- **TV Breaking News Ticker**: Smooth continuous animated marquee with live pulsing indicator and one-click story navigation.
- **Video-News Inspired Hero**: Lead investigative report with TV studio lower-third overlay, developing story badges, and side-by-side Live Desk feeds.
- **Trending Intelligence Leaderboard**: Dynamic ranking badges (`01`, `02`, `03`...) tracking reader views.
- **Opinion Desk**: Distinct editorial board layout with columnist portraits and pull-quotes.
- **One-Click Demo Switcher**: Floating switcher allowing instant role toggling (Super Admin, Chief Editor, Section Editor, Author, and Gold Subscriber) for testing.

---

## ðŸ› ï¸ Technology Stack (JavaScript Throughout - No TypeScript)

- **Frontend**: React (Vite) + Tailwind CSS + Lucide React + Recharts + Tiptap Rich-Text Editor
- **Backend**: Node.js & Express.js
- **Database**: PostgreSQL (with Prisma ORM, migrations, and zero-config local development support)
- **Authentication**: JWT & bcrypt password hashing
- **Payments**: Razorpay Subscriptions (Test Mode) + HMAC-SHA256 signature verification + Webhooks
- **Rich Text Editor**: Tiptap with formatting toolbar (headings, blockquotes, lists, links, image embedding)
- **Charts & Visualizations**: Recharts (traffic area charts, revenue lines, tier pie charts, category bars)

---

## ðŸ‘¥ Demo User Credentials

The database is pre-seeded with 5 distinct role personas:

| Role | Name | Email | Password | Clearances & Scope |
|---|---|---|---|---|
| **Super Admin** | Elena Rostova | `admin@news24.com` | `Admin@123` | Master system control, user roles, finance & plans |
| **Chief Editor** | Marcus Vance | `editor@news24.com` | `Editor@123` | Maker-checker approver, desk reviews, publish live |
| **Section Editor** | Amara Chen | `section@news24.com` | `Section@123` | Scoped review & approval for Politics desk |
| **Author / Journalist** | David Sterling | `author@news24.com` | `Author@123` | Investigative drafting & review submission (Maker) |
| **Gold Subscriber** | Rajesh Malhotra | `subscriber@news24.com` | `Subscriber@123` | Paid VIP all-access pass (Gold, Silver, Bronze, Free) |
| **Silver Subscriber** | Samantha Grey | `silver.user@news24.com` | `Subscriber@123` | Silver + Bronze + Free dispatches |
| **Bronze Subscriber** | Vikram Joshi | `bronze.user@news24.com` | `Subscriber@123` | Bronze + Free dispatches |

> **Pro Tip**: Use the **"Role Switch"** dropdown in the top header or login screen to immediately log in as any role with a single click!

---

## âš–ï¸ Maker-Checker Editorial Workflow

The platform strictly enforces the 7-stage editorial maker-checker cycle:

1. **Author Drafts**: Author creates an article in the CMS using the Tiptap rich-text editor.
2. **Author Submits**: Author submits the article to the review queue (`PENDING_REVIEW`).
3. **Queue Notification**: Section Editors and Chief Editors view pending submissions with live badge counters.
4. **Editorial Review**: Editors examine the article copy, byline, and category assignment.
5. **Maker-Checker Decision**:
   - **Approve**: Chief Editor or Section Editor approves (`APPROVED` or immediate `PUBLISHED`).
   - **Reject**: Rejections **mandate** substantive feedback explaining what factual issues to correct (`REJECTED`).
6. **Author Correction**: Author inspects rejection reasons in the article history and resubmits.
7. **Bylaw Enforcement**:
   - **Authors cannot approve their own articles** (enforced on the backend; attempts return HTTP 403).
   - **Material changes to published articles trigger mandatory re-approval**, archiving an `ArticleRevision` snapshot.
   - Every submission, review, approval, and rejection is permanently recorded in the `Approval` and `EditorialActivityLog` tables.

---

## ðŸ’Ž Subscription System & Access Hierarchy

### Access Matrix

| Tier | Monthly Rate | Annual Rate | Accessible Content |
|---|---|---|---|
| **Free** | â‚¹0 | â‚¹0 | Public dispatches, breaking news wire, live tickers |
| **Bronze** | â‚¹99/month | â‚¹999/year | Free + Bronze-tier weekly economic briefs |
| **Silver** | â‚¹199/month | â‚¹1,999/year | Free + Bronze + Silver tech analyses & market dossiers |
| **Gold** | â‚¹399/month | â‚¹3,999/year | **All articles & investigations**, unredacted vaults, VIP badge |

### Backend Content Protection Gatekeeper
- Premium tier verification is enforced directly on the Express server (`middleware/tierCheck.js`).
- If an unauthenticated or lower-tier user requests a premium story, the server **never transmits the full content**, returning `isLocked: true`, the teaser excerpt, and required tier metadata.
- Full text is decrypted and returned only after server validates an active subscription or staff role.

### Razorpay Integration
- Test-mode order creation via Razorpay API (`/api/subscriptions/create-order`).
- Client-side checkout modal with automatic UPI/Card simulation.
- HMAC-SHA256 signature verification (`/api/subscriptions/verify-payment`).
- Subscription lifecycle: activation, renewal, self-service cancellation, and tax invoices (`INV-2026-XXXX`).

---

## ðŸ“‚ Project Architecture

```
news/
â”œâ”€â”€ server/
â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â”œâ”€â”€ schema.prisma              # Active schema (SQLite default, PostgreSQL compatible)
â”‚   â”‚   â”œâ”€â”€ schema.postgresql.prisma   # Native PostgreSQL production schema
â”‚   â”‚   â”œâ”€â”€ seed.js                    # Database seed: 27 articles, 5 accounts, plans, logs
â”‚   â”‚   â””â”€â”€ migrations/0_init/         # Complete PostgreSQL DDL migration script
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/prisma.js           # Prisma client instance
â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”œâ”€â”€ authController.js      # Register, login, me, 1-click demo login
â”‚   â”‚   â”‚   â”œâ”€â”€ newsController.js      # Public broadcast wire, ticker, categories, articles
â”‚   â”‚   â”‚   â”œâ”€â”€ articleCmsController.js# Article CRUD, revision tracking
â”‚   â”‚   â”‚   â”œâ”€â”€ workflowController.js  # Maker-checker queue, approvals, rejections
â”‚   â”‚   â”‚   â”œâ”€â”€ subscriptionController.js # Razorpay orders, verification, cancellation
â”‚   â”‚   â”‚   â””â”€â”€ adminController.js     # Analytics, user roles, plans, audit logs
â”‚   â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.js                # JWT token verification
â”‚   â”‚   â”‚   â”œâ”€â”€ rbac.js                # Server-side role permissions
â”‚   â”‚   â”‚   â””â”€â”€ tierCheck.js           # Premium content gatekeeper
â”‚   â”‚   â”œâ”€â”€ routes/                    # Express route declarations
â”‚   â”‚   â”œâ”€â”€ utils/                     # JWT & Razorpay HMAC signature utilities
â”‚   â”‚   â””â”€â”€ index.js                   # Express server entry point & static client server
â”‚   â””â”€â”€ scripts/
â”‚       â”œâ”€â”€ setup-db.js                # Zero-config database initialization script
â”‚       â””â”€â”€ test-runner.js             # Automated 20-point test runner
â”œâ”€â”€ client/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ layout/                # TopBroadcastBar, Header, TVTicker, CategoryNav, Footer, AdminLayout
â”‚   â”‚   â”‚   â”œâ”€â”€ common/                # Badges, PaywallBanner, QuickDemoSwitcher
â”‚   â”‚   â”‚   â”œâ”€â”€ news/                  # HeroBroadcast, NewsCard, TrendingLeaderboard, OpinionDesk
â”‚   â”‚   â”‚   â””â”€â”€ editor/                # TiptapEditor rich text component
â”‚   â”‚   â”œâ”€â”€ context/                   # AuthContext with token & user management
â”‚   â”‚   â”œâ”€â”€ pages/                     # Public pages (Home, Article, Category, Search, Pricing, Profile)
â”‚   â”‚   â”œâ”€â”€ pages/admin/               # CMS (Dashboard, ReviewQueue, Articles, Edit, Categories, Subscriptions, Users, Logs)
â”‚   â”‚   â”œâ”€â”€ services/api.js            # Unified Fetch wrapper with Bearer tokens
â”‚   â”‚   â”œâ”€â”€ App.jsx                    # Route mapping
â”‚   â”‚   â””â”€â”€ index.css                  # Custom Tailwind styles & animations
â”‚   â”œâ”€â”€ tailwind.config.js
â”‚   â””â”€â”€ vite.config.js
â”œâ”€â”€ .env.example                       # Environment variables template
â””â”€â”€ README.md                          # Documentation
```

---

## ðŸš€ Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Initialize & Seed Database
```bash
cd server
npm run setup:db
```
*(Automatically creates SQLite database for immediate local execution and seeds 27 articles across 6 desks, 5 accounts, subscription plans, and approval records).*

### 4. Run Automated Workflow Tests
```bash
cd server
node scripts/test-runner.js
```
*(Runs 20 automated tests validating health check, news feed, auth, tier protection, maker-checker rules, self-approval prevention, rejection reasons, and Razorpay verification).*

### 5. Start Development Servers
**Option A: Unified Server (Full Stack on Port 5000)**
```bash
cd client
npm run build
cd ../server
npm start
```
Then visit: `http://localhost:5000`

**Option B: Concurrent Development (Vite HMR on Port 3000 + API on 5000)**
Terminal 1 (Backend):
```bash
cd server
npm run dev
```
Terminal 2 (Frontend):
```bash
cd client
npm run dev
```
Then visit: `http://localhost:3000`

---

## ðŸ˜ Switching to Production PostgreSQL

To connect to a live PostgreSQL instance (e.g., Supabase, Neon, AWS RDS, Docker):

1. Set `DATABASE_URL` in `server/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vanguard_news?schema=public"
```

2. Run setup:
```bash
cd server
npm run setup:db
```
The setup script detects `postgresql://`, switches Prisma to `schema.postgresql.prisma`, pushes the schema, and seeds all initial data.

---

## ðŸ”’ Security Best Practices Implemented
- Passwords salted and hashed with **bcryptjs** (10 rounds).
- Stateless **JWT** authentication with configurable expiry.
- Server-side authorization verifying roles and permissions on every protected endpoint.
- Proprietary investigative copy **never returned to unauthorized clients**.
- HMAC-SHA256 signature verification for Razorpay payments and webhooks.
- Anti-tampering Maker-Checker validation preventing self-approvals.

=======
# News24
>>>>>>> 693eef4bc69148d44c4b9637c04ba70ededecc18
