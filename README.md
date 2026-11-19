# FareLens – Bus Ticket Price Comparison & Book-Now-or-Wait Engine

FareLens is a production-oriented bus ticket comparison and travel recommendation web application for India. It aggregates fares from multiple booking portals (redBus, AbhiBus, MakeMyTrip, Paytm, and direct operators), computes the **true final payable price** (accounting for base fares, operator discounts, platform fees, GST 5% taxes, and payment-specific coupons), and provides an objective, transparent **Book Now vs. Wait and Monitor** decision recommendation.

---

## Key Features

1. **True Final Payable Price Transparency**
   - Eliminates checkout surprises: computes base fare + operator discounts + platform fee + statutory 5% GST on AC intercity transport + convenience fees - coupon discount.
   - Highlights: **Cheapest Final Price**, **Fastest Service**, **Top Rated Operator**, **Best Value**, and **Maximum Coupon Savings**.

2. **Verified Coupon Engine**
   - Evaluates coupons against specific booking conditions, ticket minimums, and payment methods (HDFC Credit/Debit cards, CRED UPI, Paytm Wallet, new user status).
   - Displays clear verification timestamps (`Verified on Nov 19, 2026`) and auto-flags expired or unverified codes.

3. **Objective Book-Now-or-Wait Recommendation Engine**
   - **`INSUFFICIENT_DATA`**: Transparent cold-start safeguard. If fewer than 5 historical snapshots over 48h exist, it produces the exact disclaimer: *"Not enough booking history to make a reliable prediction. Compare current prices and book according to your preference."*
   - **`PRICE_DROP_DETECTED`**: Automatically flags when a payable fare drops by $\ge 3\%$ compared to prior observations, showing the exact previous price and rupee savings.
   - **`HIGH_DEMAND_BOOK_NOW`**: Triggered when seat occupancy reaches $\ge 75\%$ or seats remaining drop to $\le 6$.
   - **`WAIT_AND_MONITOR`**: Recommended during early booking windows when occupancy is low and off-peak promotional discounts are probable.

4. **Multi-Provider Adapter Architecture**
   - Clean, modular interface: `BusProviderAdapter`.
   - **DemoBusAdapter**: High-fidelity, synthetic Indian intercity bus inventory (Bangalore–Hyderabad, Mumbai–Pune, Delhi–Jaipur, Chennai–Bangalore, etc.) strictly labelled with the `DEMO` provenance badge.
   - **Stubs for redBus, AbhiBus, MakeMyTrip, Goibibo, Paytm, and B2B GDS Aggregators**: Cleanly isolated with `NEEDS_CREDENTIALS` status and comprehensive documentation on how to activate official partner keys.

5. **Price Tracking & Alerts Sentinel**
   - Allows users to monitor routes or specific bus services with custom thresholds (e.g., alert when price drops by $\ge 5\%$ or falls below ₹X).

6. **Interactive 30-Day Fare Calendar**
   - Route demand heatmap highlighting cheap off-peak days (Tuesdays/Wednesdays) vs peak demand weekend surges (Friday/Sunday).

---

## Tech Stack & Architecture

- **Frontend & Fullstack**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide React icons.
- **Charts**: Recharts (72-hour price observation trend lines with tabular currency figures).
- **Validation**: Zod schema validation on all inputs and API payloads.
- **Testing**: Vitest for pure pricing, coupon evaluation, and recommendation logic unit/integration tests.
- **Data Repository**: Modular repository supporting in-memory, SQLite, and PostgreSQL/Supabase database connections.

```
farelens/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page & hero search
│   │   ├── search/page.tsx             # Comparison matrix, filters, sorting
│   │   ├── bus/[id]/page.tsx           # Dedicated bus detail, stops, history
│   │   ├── coupons/page.tsx            # Verified coupon hub & calculator
│   │   ├── calendar/page.tsx           # 30-day fare heatmap calendar
│   │   ├── alerts/page.tsx             # User price alerts management
│   │   ├── dashboard/page.tsx          # Traveller dashboard
│   │   ├── admin/page.tsx              # Provider status & coupon curation
│   │   ├── affiliate-disclosure/       # Commercial disclosure
│   │   ├── about/, privacy/, terms/    # Legal & transparency policies
│   │   └── api/v1/                     # REST API v1 endpoints
│   └── components/                     # Reusable UI components
├── packages/
│   ├── core/                           # Pure types, pricing, coupons, recommendations
│   ├── providers/                      # Provider adapters (Demo, RedBus, AbhiBus, etc.)
│   └── db/                             # Data models, seeds, repository
└── docs/
    ├── ARCHITECTURE.md                 # System diagrams & package boundaries
    ├── INTEGRATIONS.md                 # Partner API credential guide
    ├── DECISIONS.md                    # Architecture Decision Records (ADRs)
    └── API.md                          # REST API v1 documentation
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js $\ge 18.18$ (Tested on Node v24.20)
- npm $\ge 9.0$

### 2. Installation
```bash
git clone <repo-url> farelens
cd farelens
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Key environment configuration:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEMO_MODE_ENABLED="true"
DATA_FRESHNESS_MINUTES="15"
PREDICTION_MIN_SNAPSHOTS="5"
AUTH_SECRET="farelens-super-secret-jwt-key-min-32-chars-length"
ADMIN_EMAILS="admin@farelens.in"
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Production Build
```bash
npm run build
npm run start
```

### 6. Running Unit & Integration Tests
```bash
npm test
```
Runs 15 automated test suites covering:
- Pricing engine & mathematical rounding
- Coupon engine eligibility, caps, and payment method rules
- Recommendation engine heuristics, cold-start fallbacks, and price drop detection
- Provider aggregation & canonical trip normalization
- Non-negotiable data provenance tagging

---

## Data Provenance & Ethical Guidelines

FareLens strictly adheres to Indian cyber laws and provider Terms of Service:
- **No unauthorized web scraping or CAPTCHA bypass**: We do not scrape consumer booking portals.
- **Provenance Tags on Every Data Point**:
  - `LIVE_VERIFIED`: Directly fetched via authorized partner API within 15 minutes.
  - `RECENT`: Fetched earlier today.
  - `HISTORICAL`: Archived snapshot for trend calculation.
  - `ESTIMATED`: Algorithmic projection.
  - `DEMO`: Synthetic realistic data accompanied by unmissable banners.

---

## License & Commercial Notice
FareLens is proprietary software built for Indian intercity bus travellers. Booking redirects pass through `/api/v1/out/:offerId` with full affiliate relationship disclosures.
