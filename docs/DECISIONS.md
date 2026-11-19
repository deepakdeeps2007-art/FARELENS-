# FareLens Architectural & Implementation Decisions (ADR)

## Decision Log

### ADR-001: Next.js App Router for Unified Full-Stack Architecture
- **Context**: The specification calls for a responsive, modern web frontend, high performance, server-rendered route SEO, REST API v1 endpoints, and background price snapshot/evaluation capabilities.
- **Decision**: Built on Next.js 14 App Router with TypeScript, server-side route handlers (`/api/v1/...`), client-side React components with Lucide icons, and Tailwind CSS.
- **Rationale**: Eliminates the overhead of managing disparate micro-services in the MVP while maintaining strict separation of concerns via modular internal packages (`@/core`, `@/providers`, `@/db`).

### ADR-002: Provider Adapter Architecture with Strict Provenance
- **Context**: redBus, AbhiBus, MakeMyTrip, Goibibo, and Paytm do not offer open public APIs without B2B/affiliate agreements. Web scraping is strictly prohibited by terms of service and our non-negotiable data integrity rules.
- **Decision**: Implemented `BusProviderAdapter` interface with deterministic status flags (`ACTIVE`, `NEEDS_CREDENTIALS`, `NOT_AVAILABLE`, `DEMO`).
- **Provenance Rules**: Every single price and seat data point carries a provenance tag:
  - `LIVE_VERIFIED`: Real-time fetch within 15 minutes from an authorised API.
  - `RECENT`: Fetched earlier, age explicitly displayed.
  - `HISTORICAL`: Historical snapshot for trend calculations.
  - `ESTIMATED`: Statistical model output (never used for real fares).
  - `DEMO`: Synthetic realistic data, accompanied by a prominent, persistent banner and badges on every card.

### ADR-003: Pure Decision and Pricing Engines
- **Context**: Pricing, discount calculations, taxes (GST 5%), platform fees, convenience fees, coupon validation, and the Book-Now-or-Wait recommendations must be deterministic, unit-testable, and free of side-effects.
- **Decision**: Developed `RecommendationEngine` and `CouponEngine` as pure, isolated TypeScript modules with comprehensive Vitest test suites.

### ADR-004: Insufficient Data Cold-Start Safeguard
- **Context**: Recommending whether to "Wait" or "Book Now" without historical snapshots is irresponsible and deceives users.
- **Decision**: If fewer than `PREDICTION_MIN_SNAPSHOTS` (default 5 snapshots over 48h) are available for a canonical trip, the engine returns `INSUFFICIENT_DATA` with the exact copy required by the spec: *"Not enough booking history to make a reliable prediction. Compare current prices and book according to your preference."*

### ADR-005: Deep Links with Affiliate Disclosure
- **Context**: FareLens is a price comparison and decision platform, not a merchant of record or ticket issuer.
- **Decision**: Outbound clicks pass through `/api/v1/out/:offerId` which logs telemetry, attaches affiliate tracking tags if configured, and shows a transparent modal disclosing partner relationships.
