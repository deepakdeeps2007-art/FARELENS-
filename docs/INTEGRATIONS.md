# FareLens Provider Integrations Guide

This document outlines the official and legitimate routes to integrate Indian bus inventory and pricing APIs into FareLens.

## Summary of Integration Routes

| Provider | Open API? | Feasible Route | Required Credentials | Status in FareLens |
| :--- | :---: | :--- | :--- | :---: |
| **redBus** | No | redBus Affiliate Program (Impact/Cuelinks) / Direct B2B Partner API | Client ID, Client Secret, API Key, Affiliate ID | Stubbed (`NEEDS_CREDENTIALS`) |
| **AbhiBus** | No | AbhiBus B2B Partner API / Affiliate Feed | API Key, Partner Secret, Base URL | Stubbed (`NEEDS_CREDENTIALS`) |
| **MakeMyTrip** | No | MMT Affiliate Network (vCommission / Cuelinks) / Corporate API | Partner ID, Auth Secret, Campaign ID | Stubbed (`NEEDS_CREDENTIALS`) |
| **Goibibo** | No | Goibibo Affiliate Network / MMT Group Partnership | Affiliate Key, Tracking Tag | Stubbed (`NEEDS_CREDENTIALS`) |
| **Paytm Bus** | No | Paytm Affiliate Network / Developer Gateway | Client ID, Merchant Secret, Affiliate ID | Stubbed (`NEEDS_CREDENTIALS`) |
| **B2B Inventory Aggregator** | Yes (Contract) | Authorized GDS (e.g., Mantis Technologies, Bitla, TravelCarma) | Endpoint URL, Org Token, Agency Key | Implemented (`NEEDS_CREDENTIALS`) |
| **Manual / Direct Curation** | N/A | Admin verification portal | Admin JWT, verified_at timestamp | **ACTIVE** |
| **Demo Provider** | N/A | Synthetic, deterministic engine | None (Enabled via `DEMO_MODE_ENABLED=true`) | **ACTIVE** (Strictly labelled) |

---

## 1. redBus Partner API & Affiliate Program
- **Overview**: redBus provides an Affiliate Program via Impact Radius and direct B2B GDS integrations for qualified online travel agencies.
- **Application Link**: https://www.redbus.in/info/affiliate / https://impact.com
- **Environment Variables**:
  ```env
  PROVIDER_REDBUS_API_KEY="your-redbus-api-key"
  PROVIDER_REDBUS_CLIENT_ID="your-client-id"
  PROVIDER_REDBUS_BASE_URL="https://api.redbus.in/v1"
  PROVIDER_REDBUS_AFFILIATE_ID="your-impact-subid"
  ```
- **How to activate**:
  Once keys are placed in `.env.local`, set `status` in `packages/providers/src/adapters/redbus.ts` to `ACTIVE`.

## 2. AbhiBus API
- **Overview**: AbhiBus (ixigo group) offers inventory search for partners and affiliates.
- **Contact**: busapi@abhibus.com
- **Environment Variables**:
  ```env
  PROVIDER_ABHIBUS_API_KEY="your-key"
  PROVIDER_ABHIBUS_SECRET="your-secret"
  PROVIDER_ABHIBUS_BASE_URL="https://api.abhibus.com"
  PROVIDER_ABHIBUS_AFFILIATE_ID="your-affiliate-id"
  ```

## 3. Authorised Bus Aggregators (GDS)
- **Examples**: Mantis CRS / Bitla Software (direct operator booking engines).
- **Environment Variables**:
  ```env
  PROVIDER_AGGREGATOR_BASE_URL="https://api.busgds.example.com"
  PROVIDER_AGGREGATOR_API_KEY="your-gds-key"
  PROVIDER_AGGREGATOR_SECRET="your-gds-secret"
  ```

## 4. Scraping & Anti-Bot Policy
FareLens strictly adheres to Indian cyber regulations and provider Terms of Service:
- **No HTML scraping or headless browser emulation** against consumer booking portals.
- **No CAPTCHA bypass or anti-bot circumvention**.
- All data is obtained via authorized partner feeds or explicitly designated as **DEMO** with zero claims of live accuracy.
