# Security & Privacy

Honest about the demo posture and what a real deployment requires.

## Authentication (demo → real)
- **Now:** a demo identity header `X-Threshold-User` (defaults to `demo-operator`); no login. This is explicitly a demo seam.
- **Real:** SSO/OIDC for operators; service-to-service auth for any pipeline integration. No endpoint should be open.

## Authorization & tenancy
- Every table and query is scoped by `merchant_id`; one merchant's policies/jobs/conversions are never returned to another (`routers/*`).
- **Real:** per-tenant RBAC (who may propose vs approve vs view evidence), with the approval hand-off tied to Rokt's verified operations-team review (WORKFLOW.md).

## PII & data handling
- **The demo stores no real PII.** Sessions are synthetic; `customer.cc_bin` is a fictional 6-digit prefix, `customer.age`/`loyalty_segment` are synthetic. Nothing here is a real person.
- **Real:** identity/consent attributes are sensitive → encrypt in transit (TLS) and at rest (AES-256, per Rokt's verified client-side RSA + AES posture), minimize/de-identify, and never place personal data in URLs/logs.

## Consent (modeled → enforced)
- **Now:** the `consent` constraint checks that a policy doesn't use a `sensitive` attribute without `consent_required` — a *policy-compliance* check, not runtime enforcement.
- **Real (FUTURE_VISION Milestone E):** consent-aware historical replay — prove a replayed decision **excludes signals no longer legally usable** (revoked consent / deletion), grounded in mParticle's verified consent state + DSR handling. Threshold *validates* consent handling; mParticle *enforces* it.

## Integrity: the tamper-evident audit
- Append-only records, each carrying `HMAC-SHA256(server_secret, canonical_json(payload))`. `verify()` detects post-write modification by a party without the key.
- **Explicit non-goals** (THREAT_MODEL.md): not tamper-*proof* (a key-holder can forge), not a proof of semantic truth or of completeness/ordering. Terminology is always **"tamper-evident."** A real deployment anchors a chain head externally or publishes a Merkle root.

## Secrets
- `THRESHOLD_AUDIT_SECRET` and `DATABASE_URL` are env-driven with safe local defaults; the docker-compose value is a placeholder marked "change-me." Real deployment uses a secret manager + a dedicated, isolated audit-signing key.

## Data ownership & boundary
- Threshold is **offline / pre-release** and never sits in the live serving path — it cannot affect a real customer's checkout. It consumes (in the vision) anonymized event-time logs the partner owns; it never becomes a new system of record for customer data.

## Web / transport
- CORS is restricted to the local origins; a real deployment tightens origins and adds a CSP consistent with Rokt's verified `script-src`/`frame-src` posture. No third-party runtime calls from the console beyond its own API.

## Dependency hygiene
- Next.js is pinned at 14.2.15, which carries a later-patched advisory — **bump to a patched 14.2.x before any hosting.** Python deps are pinned in `requirements.txt`.
