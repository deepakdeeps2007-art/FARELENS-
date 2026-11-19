# FareLens System Architecture

## Overview
FareLens is an Indian bus ticket price comparison and decision platform. It aggregates fares from multiple booking providers, computes the true final payable price (accounting for platform fees, GST taxes, convenience fees, and verified coupons), and provides an objective Book-Now-vs-Wait recommendation engine.

```
+-----------------------------------------------------------------------------------+
|                                 Next.js 14 Web UI                                 |
|  - Hero Search & Autocomplete      - Bus Comparison Matrix    - Coupon Discovery  |
|  - Live/Demo Provenance Badges     - Price Breakdown Drawer   - Price Chart       |
|  - Book-Now-or-Wait Engine Card    - Tracking & Alert Hub     - Admin Curation    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                               REST API Layer (v1)                                 |
|  /api/v1/search   /api/v1/trips/:id   /api/v1/coupons/calculate   /api/v1/alerts  |
+-----------------------------------------------------------------------------------+
      |                                   |                              |
      v                                   v                              v
+--------------------+           +--------------------+         +-------------------+
|  Provider Registry |           |   Coupon Engine    |         |  Recommendation   |
|  - Parallel fetch  |           | - Rule Evaluation  |         |      Engine       |
|  - Timeout & retry |           | - Bank / UPI / Nil |         | - Pure heuristics |
|  - Provenance tag  |           | - Real savings cap |         | - History signals |
+--------------------+           +--------------------+         +-------------------+
      |
      +---> DemoAdapter (Synthetic, deterministic Indian bus routes)
      +---> ManualAdapter (Admin curated feeds)
      +---> Stubs (redBus, AbhiBus, MMT, Goibibo, Paytm)
```

## Packages

### 1. `@farelens/core` (`packages/core`)
- **Types**: Definitive TypeScript types for `BusOffer`, `CanonicalBusTrip`, `ProviderOffer`, `PriceBreakdown`, `CouponRule`, `PriceSnapshot`, `RecommendationVerdict`, and `AlertRule`.
- **Pricing**: `calculateFinalPrice(offer, coupon?)` guarantees mathematical precision for base fare + GST (5%) + platform fee + convenience fee - discount.
- **Coupons**: `CouponEngine` evaluates applicable promo codes for public, payment-specific (HDFC, ICICI, Cred, UPI), or new-user promotions.
- **Recommendation**: `RecommendationEngine` processes current prices, historical volatility, observed seats remaining, and days to departure to yield transparent guidance without deceptive urgency patterns.

### 2. `@farelens/providers` (`packages/providers`)
- Implements `BusProviderAdapter` interface.
- Normalizes disparate schemas into `CanonicalBusTrip` and matched `NormalizedBusOffer` items.
- Manages fallback, timeouts (8s), and circuit breaker isolation.

### 3. `@farelens/db` (`packages/db`)
- In-memory and persistent SQLite/Postgres repository for:
  - Indian cities & popular routes
  - Canonical bus trips & operators (VRL, SRS, Orange, Zingbus, IntrCity, KPN, etc.)
  - Historical price snapshots with timestamps
  - Verified coupons
  - User alerts, preferences, and saved routes
