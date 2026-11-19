# FareLens REST API Specification (v1)

All endpoints conform to standard JSON responses and error envelopes:
```json
{
  "success": true,
  "data": { ... }
}
```
Error envelope:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Detailed human-readable error description"
  }
}
```

## Endpoints

### 1. Cities Autocomplete
`GET /api/v1/cities?q={query}`
- Returns matching Indian cities with state and popular status.

### 2. Search Buses
`POST /api/v1/search`
- **Request Body**:
  ```json
  {
    "fromCity": "Bangalore",
    "toCity": "Hyderabad",
    "journeyDate": "2026-11-20",
    "passengers": 1,
    "preferences": {
      "busType": "ALL",
      "acOnly": false,
      "sleeperOnly": false
    }
  }
  ```
- **Response**: Array of grouped bus trips, comparison across providers, final prices, highlights, and provenance badges.

### 3. Trip Details & Price History
`GET /api/v1/trips/:id`
- Returns full canonical trip data, boarding/dropping points, amenities, and current offers across all providers.

`GET /api/v1/trips/:id/price-history`
- Returns historical price snapshots captured for this trip over time, including timestamps and seats remaining if provided.

### 4. Recommendation Engine
`GET /api/v1/trips/:id/recommendation`
- Returns Book Now vs Wait verdict, confidence score (`LOW` | `MEDIUM` | `HIGH`), probabilities, evidence list, monitor recommendation, and legal disclaimer.

### 5. Coupon Discovery & Calculation
`GET /api/v1/coupons`
- Returns active coupons with verification status and metadata.

`POST /api/v1/coupons/calculate`
- **Request Body**:
  ```json
  {
    "offerId": "offer-123",
    "basePrice": 1200,
    "paymentMethod": "HDFC_CREDIT_CARD"
  }
  ```
- **Response**: Best applicable coupon, discount amount, new final payable price, and reasons for ineligible coupons.

### 6. Price Alerts
`POST /api/v1/alerts`
- Create a price alert rule for route or specific trip.
`GET /api/v1/alerts`
- List user's active alerts.
`DELETE /api/v1/alerts/:id`
- Cancel an alert.

### 7. Outbound Redirect Tracker
`POST /api/v1/out/:offerId`
- Logs outbound click with affiliate tag and issues redirect URL with partner disclosure.
