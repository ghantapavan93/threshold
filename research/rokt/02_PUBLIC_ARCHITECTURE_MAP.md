# Rokt — Public Architecture, SDK, API & Data-Flow Map

**Agent 2 — Architecture, SDK, API & Data-Flow Researcher**
**Retrieval date:** 2026-07-18
**Primary source:** docs.rokt.com (official public documentation)
**Evidence labels:** `[VERIFIED-PUBLIC]` = stated in public docs; `[INFERENCE]` = reasoned from public evidence; `[HYPOTHESIS]` = plausible but unconfirmed.

> Note on labeling: This report never claims Rokt *lacks* a capability. Absence of a documented feature is recorded as "not found in reviewed public docs," not as a limitation.

---

## 1. Executive Orientation

Rokt exposes two commercial surfaces that share one technical spine:

- **Rokt Ecommerce** — website/app operators render Rokt "placements" (offers/experiences) in their own funnel, typically on the confirmation/thank-you page. `[VERIFIED-PUBLIC]`
- **Rokt Ads** — advertisers run campaigns and report conversions back to Rokt for attribution and optimization. `[VERIFIED-PUBLIC]`

Both are served through a matrix of **client SDKs** (Web, iOS, Android, React Native, Flutter, Cordova, .NET MAUI, Tag Managers) and **server-to-server APIs** (Event API, Event & Audience API, Cart API, Data Deletion API, Custom Audience Import, Nurture Unsubscribe, Reporting API). `[VERIFIED-PUBLIC]`
Source: Integration guides overview (last updated Sep 17, 2025); API reference overview (last updated Oct 24, 2023).

---

## 2. Pipeline Data-Flow Diagram (public-evidence)

```
                                 ROKT PUBLIC PIPELINE (evidence-mapped)
 ┌──────────────┐
 │  CUSTOMER    │  end user on partner web/app
 └──────┬───────┘
        │  browses, adds to cart, pays
        ▼
 ┌────────────────────────┐
 │  PARTNER EXPERIENCE     │  partner site/app funnel: home, PLP, PDP, cart, checkout, confirmation
 │  [VERIFIED-PUBLIC]      │  page identifiers e.g. prod.rokt.conf, stg.rokt.payments
 └──────┬─────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────────────────────┐
 │  SDK / API LAYER                                                       │
 │  ── Client SDKs: Web SDK / SDK+ (<30KB, global CDN), iOS, Android,     │
 │     React Native, Flutter, Cordova, .NET MAUI  [VERIFIED-PUBLIC]       │
 │  ── Server APIs: Event API, Event & Audience API, Cart API,            │
 │     Data Deletion, Custom Audience Import, Reporting  [VERIFIED-PUBLIC]│
 └──────┬───────────────────────────────────────────────────────────────┘
        │  init(apiKey), identifyRequest, selectPlacements / execute
        ▼
 ┌────────────────────────┐
 │  IDENTITY & DATA LAYER  │  email (raw/lowercased), emailsha256, mobile (E.164),
 │  [VERIFIED-PUBLIC]      │  customerid, Rokt Click ID (passbackconversiontrackingid)
 │                         │  PII encrypted client-side (RSA-OAEP-SHA256) + AES-256 at rest
 └──────┬─────────────────┘
        │  attributes: customer type, loyalty, UTM, cart items (SKU/price/qty), totals
        ▼
 ┌────────────────────────┐
 │  ELIGIBILITY & CONTROLS │  POST /v1/placements/any (are there placements?),
 │  [VERIFIED-PUBLIC/INF]  │  noFunctional / noTargeting consent flags, CSP allowlist,
 │                         │  sandboxed cross-origin iframes
 └──────┬─────────────────┘
        │  /experiences request (expect HTTP 200)
        ▼
 ┌────────────────────────┐
 │  ROKT BRAIN (decisioning│  AI relevance/optimization ("maximizes relevance through
 │  & optimization)        │   AI prediction"), experiments/holdout tests
 │  [VERIFIED-PUBLIC/INF]  │  (internal ranking mechanics not publicly detailed)
 └──────┬─────────────────┘
        │  selected offers/experiences
        ▼
 ┌────────────────────────┐
 │  NETWORK / CATALOG      │  advertiser campaigns, creatives, audience lists;
 │  [VERIFIED-PUBLIC/INF]  │  Cart API cross-sell catalog via providers
 └──────┬─────────────────┘
        │
        ▼
 ┌────────────────────────┐
 │  NATIVE EXPERIENCE      │  Overlay / Embedded / Interstitial (<rokt-thank-you>);
 │  [VERIFIED-PUBLIC]      │  mobile RoktLayout (Compose / SwiftUI, v4+)
 └──────┬─────────────────┘
        │  emits: PLACEMENT_READY, PLACEMENT_INTERACTIVE, OFFER_ENGAGEMENT,
        │  POSITIVE_ENGAGEMENT, PLACEMENT_RESIZE, PLACEMENT_CLOSED,
        │  PLACEMENT_COMPLETED, PLACEMENT_FAILURE
        ▼
 ┌────────────────────────┐
 │  CUSTOMER ACTION        │  engage / accept offer / add cross-sell item to cart
 │  [VERIFIED-PUBLIC]      │
 └──────┬─────────────────┘
        │
        ▼
 ┌────────────────────────────────────────────────────────────┐
 │  TRANSACTION STATE (Cart API v1)  [VERIFIED-PUBLIC]         │
 │   reserve → (release | confirm) → cancel                   │
 │   /v1/cart/reserve  → itemReservationId, expirationDateTimeUtc
 │   /v1/cart/release  → free unconfirmed reservation         │
 │   /v1/cart/confirm  → itemConfirmationId, itemConfirmationUrl
 │   /v1/confirmation/cancel → cancel confirmed item          │
 │   (auto-release on timeout if unconfirmed)                 │
 └──────┬─────────────────────────────────────────────────────┘
        │  conversion signal
        ▼
 ┌────────────────────────┐
 │  ATTRIBUTION            │  match by email / emailsha256 / Rokt Click ID or
 │  [VERIFIED-PUBLIC]      │  (firstname+lastname+billing zip | mobile);
 │                         │  dedup by transactionid or confirmationref
 └──────┬─────────────────┘
        │
        ▼
 ┌────────────────────────┐
 │  LEARNING LOOP          │  optimization signal feedback, experiments/holdouts,
 │  [VERIFIED-PUBLIC/INF]  │  Integration Monitor (GA/session reconciliation, alerting)
 └────────────────────────┘
```

---

## 3. Stage-by-Stage Evidence

### Stage 1 — CUSTOMER → PARTNER EXPERIENCE
`[VERIFIED-PUBLIC]` The Web SDK+ tracks the funnel with page-type identifiers: "home, PLP, PDP, cart, checkout, confirmation." Placement pages use identifiers like `prod.rokt.conf` and `stg.rokt.payments`.
Source: Web SDK+ Integration Guide (last updated Jul 15, 2026).
**Integration/extension point:** `[VERIFIED-PUBLIC]` Rokt recommends placing the init script on *every page* so users are tracked across the funnel and can be retargeted on abandonment — a per-page hook surface. (Web SDK Integration Guide.)

### Stage 2 — SDK / API LAYER
`[VERIFIED-PUBLIC]` "The Rokt Web SDK facilitates communication between the frontend of your website and Rokt's own systems." It is "lightweight (under 30KB) and distributed globally via a CDN." Legacy `launcher.js`/`snippet.js` were replaced by a single initialization script.
Client SDK matrix `[VERIFIED-PUBLIC]`: Web, iOS, Android, React Native, Flutter, Cordova, .NET MAUI, Tag Managers.
- Flutter SDK published on **pub.dev** (`rokt_sdk`); repo `ROKT/rokt-sdk-flutter`. `[VERIFIED-PUBLIC]`
- React Native SDK on **npm** (`@rokt/react-native-sdk`); resolved from **Maven Central** via autolinking. `[VERIFIED-PUBLIC]`
- iOS SDK: "lightweight, secure, simple to integrate"; overlay + embedded placements. `[VERIFIED-PUBLIC]` (Distribution channel — CocoaPods/SPM — not stated on the overview page reviewed. `[INFERENCE]` likely both, standard for this SDK class.)
Sources: Web SDK overview; Integration guides overview (Sep 17, 2025); iOS SDK overview (Oct 14, 2025).

### Stage 3 — IDENTITY & DATA LAYER
`[VERIFIED-PUBLIC]` Supported identifiers: raw unhashed email (preferred), SHA-256 hashed email/mobile, E.164 phone, internal customer IDs, and the Rokt Click ID.
`[VERIFIED-PUBLIC]` "Set attributes as early as possible… Earlier attribute collection gives Rokt more signal to work with for preloading."
Attribute classes span lifecycle (customer type, loyalty tier), marketing attribution (UTM), address (at checkout), and cart contents (SKU, name, price, quantity, category, brand, variant).
**Data classes** `[VERIFIED-PUBLIC]` (Data overview, Dec 17, 2025): (1) *Your/Partner Data* (name, email, zip, payment type, cart value, order confirmation number); (2) *Rokt/Derived Data* (engagement timestamps, creative engagement); (3) *Advertiser & Provider Data* (audience lists, creative ID, conversion event); (4) *Licensed Data* (third-party e.g. LiveRamp, used outside EU/UK).
Sources: Web SDK+ guide (Jul 15, 2026); Data overview (Dec 17, 2025).

### Stage 4 — ELIGIBILITY & CONTROLS
`[VERIFIED-PUBLIC]` Cart API `POST /v1/placements/any` "Determines whether placements exist to display," letting partners "skip the upsell/cross-sell stage if applicable." (Cart API, last updated Dec 12, 2025.)
`[VERIFIED-PUBLIC]` Consent controls: `noFunctional: true` disables browser identifiers/cookies; `noTargeting: true` disables cross-site targeting identifiers — independent or combined. (Web SDK security, Jun 11, 2026.)
`[VERIFIED-PUBLIC]` **CSP allowlist required** —
`script-src https://apps.rokt.com https://apps.rokt-api.com https://apps.roktecommerce.com https://sourcemaps-wsdk.roktinternal.com;`
`frame-src https://apps.rokt.com https://apps.rokt-api.com https://apps.roktecommerce.com;`
Functionality is pushed "into sandboxed cross-origin iframes to maintain a minimal surface area on the parent page." Sandbox attrs: `allow-scripts`, `allow-same-origin`, `allow-popups`, `allow-popups-to-escape-sandbox`, `allow-forms`. **Subresource Integrity (SRI) is not supported** — Rokt updates as often as bi-weekly, so version management is automatic rather than SRI-locked.
Source: Web SDK security (Jun 11, 2026).

### Stage 5 — ROKT BRAIN (decisioning/optimization)
`[VERIFIED-PUBLIC]` Rokt "maximizes relevance through AI prediction" and personalization (Data overview). The Event API "maximizes the potential of Rokt's automated optimization tools."
`[INFERENCE]` A real-time decisioning/ranking engine selects offers per impression from the `/experiences` call; internal model architecture and ranking features are **not publicly detailed** (proprietary). Do not treat internals as documented.

### Stage 6 — NETWORK / CATALOG
`[VERIFIED-PUBLIC]` Advertiser & Provider data includes "audience lists, creative ID, conversion event." Cart API confirmation states "Rokt will then inform the relevant provider of the products for fulfillment," and cancellations cause Rokt to "call the relevant provider to make a cancellation and relay back its response" — implying a provider/catalog network behind cross-sell items.
Source: Cart API (Dec 12, 2025); Data overview.

### Stage 7 — NATIVE EXPERIENCE (rendering)
`[VERIFIED-PUBLIC]` Web formats: **Overlay** (full-screen modal, no DOM changes), **Embedded** (fixed containers; required for Pay+), **Interstitial** (full-page, wrapped in `<rokt-thank-you>`, between payment and confirmation).
`[VERIFIED-PUBLIC]` Mobile (v4+): declarative `RoktLayout` — `RoktLayout` **composable** on Android (Jetpack Compose, removes need for `Rokt.execute`) and `RoktLayout` **component** on iOS (SwiftUI, removes need for `Rokt.selectPlacements`).
Sources: Web SDK+ guide; SDK migration search results; Android/iOS version pages.

### Stage 8 — CUSTOMER ACTION → engagement events
`[VERIFIED-PUBLIC]` Event-based integration (last updated Feb 2, 2026) exposes `Selection.on()` and `Selection.getPlacements()`. Emitted events:
`OFFER_ENGAGEMENT`, `POSITIVE_ENGAGEMENT`, `PLACEMENT_CLOSED`, `PLACEMENT_COMPLETED`, `PLACEMENT_INTERACTIVE`, `PLACEMENT_READY`, `PLACEMENT_RESIZE`, and — the documented **failure path** — `PLACEMENT_FAILURE` ("describes whenever a placement encounters an error it cannot recover from").
**Extension point** `[VERIFIED-PUBLIC]`: docs show wiring these to Google Tag Manager `window.dataLayer`.

### Stage 9 — TRANSACTION STATE (Cart API v1)
`[VERIFIED-PUBLIC]` Full lifecycle (Cart API, Dec 12, 2025):
- `POST /v1/cart/reserve` — reserves items "for a set period of time"; returns `itemReservationId`, `unitPrice`, `totalPrice`, `currency`, `expirationDateTimeUtc`, `success`.
- `POST /v1/cart/release` — cancels reservations; "Reserved items that are not confirmed are automatically released after timeout."
- `POST /v1/cart/confirm` — confirms purchase; returns `itemConfirmationId`, `itemConfirmationUrl`. Items must carry (`cartItemId` + `itemReservationId`) OR (`cartItemId` + `quantity`).
- `POST /v1/confirmation/cancel` — cancels a confirmed item (request: `itemReservationId`).
**Refunds:** `[VERIFIED-PUBLIC — absence noted]` No dedicated refund endpoint appears in the Cart API reference reviewed ("No refund endpoint documented"). However `[VERIFIED-PUBLIC]` the **Web SDK+ commerce events do include refunds** ("product views, add-to-cart, checkout initiation, purchase completion, and refunds") — so refund signaling exists via the events path even though Cart API fulfillment cancellation is the `/confirmation/cancel` route. Two integrations are required: backend cart/checkout + Web SDK frontend.

### Stage 10 — ATTRIBUTION
`[VERIFIED-PUBLIC]` (ConversionAttribution, Apr 7, 2025) Requires at least one of `email`, `emailsha256`, or Rokt ID (`passbackconversiontrackingid` = "a Rokt-generated Click ID used to match conversion events to the originating click"). Additional matching keys: "the combination of firstname, last name and billing zip or mobile phone number."
**Deduplication** `[VERIFIED-PUBLIC]`: by `transactionid` (primary) or `confirmationref` (fallback). For dual Web SDK + Event API setups, populate the same dedup field in both. The deprecated Event API also dedups conversion + confirmationref combos.

### Stage 11 — LEARNING LOOP
`[VERIFIED-PUBLIC]` **Experiments**: "controlled A/B and multivariate tests to compare two or more variants of the same page," plus **holdout tests** (Rokt Ecommerce and Rokt Ads experiment guides).
`[VERIFIED-PUBLIC]` **Integration Monitor** (Jun 13, 2025): no-code connector (set up via **Workato**) that reconciles Rokt Web SDK records against external systems like Google Analytics — "A discrepancy between the session numbers would imply something has gone wrong and can alert Rokt to conduct an investigation." Rokt configures monitors + alerting during setup.
`[INFERENCE]` Engagement/conversion signals feed back into Stage 5 optimization; explicit model-retraining cadence is not publicly documented.

---

## 4. Server-to-Server APIs (public catalog)

| API | Purpose (verbatim/paraphrase) | Key facts | Status |
|---|---|---|---|
| **Cart API** | Add products to a customer's cart within a transaction | `v1` endpoints reserve/release/confirm/cancel + `/placements/any`; header `rokt-api-key`, `rokt-tag-id` | `[VERIFIED-PUBLIC]` active (Dec 12, 2025) |
| **Event & Audience API** (current, recommended) | Send conversion + audience data server-side; near-real-time, resistant to ad blockers | `POST /v2/events` via `s2s.us2.mparticle.com`; Basic auth (Base64 key:secret); identity via `user_identities.email/other/customerid/other2` + `integration_attributes.1277.passbackconversiontrackingid`; dedup `conversiontype`+`confirmationref`; 202 accepted; 270 batches/s, 256 KB max | `[VERIFIED-PUBLIC]` active |
| **Event API** (Rokt Ads) | Conversion reporting to close attribution loop | `POST /v2/events`; `accountId`, `events[]`, `clientEventId`, `eventTime`, `eventType="conversion"`, `objectData`; identity email/emailsha256/passbackconversiontrackingid; dedup transactionid/confirmationref | `[VERIFIED-PUBLIC]` **deprecated** — "will no longer receive new updates" (Mar 19, 2026); migrate to Event & Audience API |
| **Data Deletion API** | Handle data removal requests (GDPR/CCPA) | Referenced in security + API reference | `[VERIFIED-PUBLIC]` |
| **Custom Audience Import** | Import audience segments | API reference overview | `[VERIFIED-PUBLIC]` |
| **Nurture Unsubscribe** | Manage unsubscribe operations | API reference overview | `[VERIFIED-PUBLIC]` |
| **Reporting API** | "performance insights" data retrieval | API reference overview | `[VERIFIED-PUBLIC]` |

Note `[VERIFIED-PUBLIC]`: The current Event & Audience API and mParticle Event connector both route through **mParticle** infrastructure (`s2s.us2.mparticle.com`) — consistent with Rokt's acquisition of mParticle. The `integration_attributes.1277` key ties the payload to a specific mParticle partner feed.

---

## 5. Encryption, Privacy & Trust (public)

- **In transit** `[VERIFIED-PUBLIC]`: HTTPS/TLS 1.2 (also SFTP, IPSec VPN); insecure requests upgraded to HTTPS or dropped. (Data overview.)
- **At rest** `[VERIFIED-PUBLIC]`: AES-256 across AWS; PII gets additional **envelope encryption with per-client unique keys** (cell-level). Data centers: Oregon, Virginia, Sydney, Ireland. (Data overview.)
- **Client-side PII encryption** `[VERIFIED-PUBLIC]`: asymmetric `RSA/ECB/OAEPWithSHA-256AndMGF1Padding` on first name, last name, email, phone; customer encrypts with Rokt public key, Base64-encodes, sends Key ID; yearly key rotation. (Encryption page, Oct 24, 2023 — oldest reviewed page.)
- **Client separation** `[VERIFIED-PUBLIC]`: data "stored separately," not "commingled"; Rokt acts as trusted intermediary.
- **Certifications** `[VERIFIED-PUBLIC]`: ISO/IEC 27001 (Lloyd's Register), SOC 2 Type 2 + SOC 1 Type 2 (AssuranceLab). Regulations: GDPR, CCPA, CPRA, APPI. Compliance portal at compliance.rokt.com; vulnerability disclosure via Bugcrowd (since 2022); security@rokt.com. (Trust Center, Jun 5, 2024.)

---

## 6. Versioning, Deprecations & Migration (public)

- `[VERIFIED-PUBLIC]` **Web SDK migration** (Jul 1, 2026): versions ≤ `2.5926.0` migrate to current. Breaking changes: **Account ID → API Key**; `launcher.js`/`snippet.js` → single init script; `sandbox:true` → `isDevelopmentMode`; user identity via `identifyRequest.userIdentities`; new optional `ROKT_DOMAIN` first-party subdomain routing; CSP must add `https://apps.rokt-api.com`.
- `[VERIFIED-PUBLIC]` **Mobile v4**: declarative `RoktLayout` (Compose/SwiftUI) replaces imperative `Rokt.execute` / `Rokt.selectPlacements`.
- `[VERIFIED-PUBLIC]` Multiple SDK pages are explicitly marked **"(Legacy)"** (iOS, Android, React Native overviews, Web best-practice/testing) — indicating a current-vs-legacy generational split across the SDK line.
- `[VERIFIED-PUBLIC]` **Event API deprecated**; Event & Audience API is the forward path.

---

## 7. Most Credible Integration / Extension Points

1. `[VERIFIED-PUBLIC]` **Client-side event bus** — `Selection.on(EVENT)` / `getPlacements()` with 8 documented events (incl. `PLACEMENT_FAILURE`), wireable to GTM `dataLayer`. Cleanest hook for custom analytics/orchestration.
2. `[VERIFIED-PUBLIC]` **Server-to-server Event & Audience API** (`/v2/events`) — channel-agnostic conversion + audience ingestion, ad-blocker-resistant; the strategic integration surface post-mParticle.
3. `[VERIFIED-PUBLIC]` **Cart API transactional state machine** (reserve→confirm/release→cancel) — deep commerce integration for cross-sell fulfillment via third-party providers.
4. `[VERIFIED-PUBLIC]` **Placement gating** via `/v1/placements/any` — lets partners conditionally short-circuit the offer stage.
5. `[VERIFIED-PUBLIC]` **First-party domain routing** (`ROKT_DOMAIN`) — CNAME-style subdomain to improve identity durability / reduce third-party blocking.
6. `[VERIFIED-PUBLIC]` **Integration Monitor via Workato** + GA reconciliation — a no-code observability/alerting extension point.
7. `[VERIFIED-PUBLIC]` **Tag Manager / Server-Side Tagging** paths and pre-built connectors (mParticle, Tealium, Shopify one-click) — low/no-code integration lanes.

---

## 8. Failure Paths (public evidence)

- `[VERIFIED-PUBLIC]` **Client render failure**: `PLACEMENT_FAILURE` event ("error it cannot recover from"). Init script "loads the SDK asynchronously with fallback error handling."
- `[VERIFIED-PUBLIC]` **Reservation timeout**: unconfirmed Cart API reservations "automatically released after timeout."
- `[VERIFIED-PUBLIC]` **API error handling**: Event API returns 400/401/403/429 (with `Retry-After`)/5xx; exponential backoff w/ jitter recommended; "error handling to ensure data is never lost."
- `[VERIFIED-PUBLIC]` **Integration drift**: Integration Monitor flags session/conversion discrepancies vs GA and alerts Rokt.
- `[VERIFIED-PUBLIC]` **Validation**: monitor `/experiences` network call for HTTP 200 in dev tools.

---

## 9. Sources (all retrieved 2026-07-18)

1. Integration guides overview — https://docs.rokt.com/developers/integration-guides/overview/ (updated Sep 17, 2025)
2. Web SDK overview — https://docs.rokt.com/developers/integration-guides/web/overview/
3. Web SDK Integration Guide — https://docs.rokt.com/developers/integration-guides/getting-started/advertisers/ads-sdk-integration/
4. Web SDK+ / Ecommerce SDK Integration — https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-sdk-integration/ (updated Jul 15, 2026)
5. Web SDK security — https://docs.rokt.com/developers/integration-guides/data-and-security/web-security/ (updated Jun 11, 2026)
6. Event-based integration — https://docs.rokt.com/developers/integration-guides/web/advanced/event-based-integration/ (updated Feb 2, 2026)
7. Web SDK Migration Guide — https://docs.rokt.com/developers/integration-guides/getting-started/sdk-migration-guide/ (updated Jul 1, 2026)
8. Cart API — https://docs.rokt.com/developers/api-reference/cart-api/ (updated Dec 12, 2025)
9. Cart confirm endpoint — https://docs.rokt.com/developers/api-reference/cart/post-v1-cart-confirm/
10. Cart release endpoint — https://docs.rokt.com/docs/developers/api-reference/cart/post-v1-cart-release/
11. Event API (Rokt Ads, deprecated) — https://docs.rokt.com/developers/integration-guides/rokt-ads/event-api/ (updated Mar 19, 2026)
12. Event and Audience API Integration Guide — https://docs.rokt.com/developers/integration-guides/getting-started/advertisers/ads-events-api-integration/
13. ConversionAttribution — https://docs.rokt.com/developers/integration-guides/getting-started-tree-components/conversionattribution/ (updated Apr 7, 2025)
14. API reference overview — https://docs.rokt.com/developers/api-reference/overview/ (updated Oct 24, 2023)
15. iOS SDK overview (Legacy) — https://docs.rokt.com/developers/integration-guides/ios/overview/ (updated Oct 14, 2025)
16. Android SDK overview (Legacy) — https://docs.rokt.com/developers/integration-guides/android/overview/ (updated Oct 14, 2025)
17. React Native SDK overview (Legacy) — https://docs.rokt.com/developers/integration-guides/reactnative/overview/
18. Flutter package — https://pub.dev/packages/rokt_sdk ; repo https://github.com/ROKT/rokt-sdk-flutter
19. React Native npm — https://www.npmjs.com/package/@rokt/react-native-sdk
20. Data overview — https://docs.rokt.com/user-guides/rokt-ecommerce/data-integration-overview/ (updated Dec 17, 2025)
21. Encryption — https://docs.rokt.com/developers/integration-guides/data-and-security/encryption/ (updated Oct 24, 2023)
22. Trust Center — https://docs.rokt.com/trust-center/ (updated Jun 5, 2024)
23. Integration Monitor — https://docs.rokt.com/developers/integration-guides/integration-monitor/ (updated Jun 13, 2025)
24. Experiments overview (Ecommerce) — https://docs.rokt.com/user-guides/rokt-ecommerce/experiments/overview/
25. Experiments (Ads) — https://docs.rokt.com/user-guides/rokt-ads/experiments/resources/overview/
26. mParticle Rokt Event connector — https://docs.mparticle.com/integrations/rokt/event/

---

## 10. Freshness / Confidence Note

- **High confidence / current**: Web SDK+ (Jul 2026), Web security/CSP (Jun 2026), migration guide (Jul 2026), event bus (Feb 2026), Cart API (Dec 2025), data overview (Dec 2025), Event API deprecation (Mar 2026). These pages are freshly maintained.
- **Lower freshness (verify before relying)**: Encryption page and API reference overview both last updated **Oct 24, 2023**; Trust Center **Jun 5, 2024**. Certifications/regulations may have advanced since.
- **Not publicly detailed (do not over-claim)**: Rokt Brain internal ranking/model architecture; exact model retraining cadence; iOS distribution channel specifics (CocoaPods/SPM) on the overview page; full Audience-side schema of the Event & Audience API (the guide surfaced the Events half most clearly).
- **Method caveat**: Page contents were extracted via automated fetch+summarization; verbatim quotes are preserved where shown, but exact field lists on deep reference pages should be re-checked against the live endpoint reference before implementation.
- **No capability was recorded as absent.** Where a feature was not found, it is marked "not found in reviewed public docs," not "unsupported."
