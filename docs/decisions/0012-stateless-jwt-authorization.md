---
title: "ADR 0012: Adopt Stateless JWT Authorization for Latency Reduction"
date: "2026-06-08"
status: "accepted"
---

# ADR 0012: Adopt Stateless JWT Authorization for Latency Reduction

## Context

The application relies on Neon Postgres database and Upstash Redis instances deployed in the `us-east-1` region. However, development and potentially end-user traffic originates from Asia (e.g., Indonesia). This cross-continental distance introduces a strict physical network latency of ~250ms per round-trip request.

During the initialization of a user session in Next.js Server Components (e.g., `DashboardLayout`), the application performed several sequential operations:
1. Verify Neon Auth session.
2. Fetch User Role (from Redis/DB).
3. Check Feature Flags (from Redis/DB).
4. Check User Permissions (from DB).

Even with Redis caching (as implemented in ADR-0011), the sequential network trips accumulated, resulting in perceived page load times exceeding 1000ms. Because we cannot alter the speed of light, any request to `us-east-1` from Asia will inherently block rendering.

## Decision

We have decided to move authorization state (User Role, User Permissions, and Feature Flags) to the edge/client by issuing a custom, stateless JWT cookie upon login.

1. **Custom JWT Payload**: We will use the `jose` package to sign a custom token containing the `role`, `permissions`, and `flags` claims.
2. **Cookie Storage**: This JWT will be stored as an HTTP-only secure cookie named `inventory_auth_state` with a short TTL (15 minutes).
3. **Stateless Overrides**: The `getUserRole`, `hasPermission`, and `isFeatureEnabled` functions will be updated to first inspect the `inventory_auth_state` cookie. If valid, they return the values synchronously, entirely bypassing the network.

## Consequences

### Positive
- **Near-zero Latency**: Authorization checks during server-side rendering now execute in < 5ms since they require no external network requests.
- **Reduced DB/Redis Load**: The number of queries hitting Neon and Upstash drops drastically, lowering operational costs and connection pool exhaustion.

### Negative / Trade-offs
- **Stale Authorization State**: If an administrator changes a user's role or revokes a permission, the changes will not take effect for the user until their JWT cookie expires (up to 15 minutes). The team has explicitly accepted this trade-off in favor of performance.
- **Cookie Size Limits**: Browsers limit cookie sizes (typically 4KB). If the list of permissions or feature flags grows excessively large, the JWT may exceed this limit. We must monitor the payload size.
- **Complexity**: We now have two auth tokens (Neon Auth for identity, and our custom JWT for authorization state).

## Alternatives Considered

- **Move Infrastructure to Asia**: Relocating the database and Redis instances to `ap-southeast-1` would solve the latency issue fundamentally, but requires infrastructure migration.
- **Next.js Local Cache (`unstable_cache`)**: Wrapping external calls in Next.js internal data cache would work for Vercel deployments, but adds complex cache-invalidation mechanisms requiring external webhooks when users change roles.

## Verification

- [ ] `npm run build` succeeds.
- [ ] Navigating through the dashboard is perceived as instantaneous.
- [ ] Inspecting the browser cookies reveals `inventory_auth_state`.

## More Information
- See `src/lib/auth/jwt.ts` for the signing and verification implementation.
