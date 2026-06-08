---
status: proposed
date: 2026-06-08
decision-makers: Developer, User
---

# Replace Neon Auth with Supabase Auth

## Context and Problem Statement

Following the adoption of a database-agnostic architecture (ADR 0012) and the migration to Supabase as the primary database, the application was still relying on Neon Auth (`@neondatabase/auth`) for authentication. Neon Auth is tightly coupled to NeonDB and its schema. To fully complete the migration to Supabase and maintain a unified stack, we need to replace the authentication layer.

## Decision

We will replace Neon Auth with Supabase Auth:
- Uninstall `@neondatabase/auth`.
- Install `@supabase/ssr` and `@supabase/supabase-js`.
- Implement the `AuthAdapter` interface using the Supabase SSR client for server-side operations and Next.js Route Handlers.
- Update the client-side Auth helper to use the Supabase Browser client.
- We will only replicate the existing Email/Password functionality without adding third-party OAuth providers for now.

## Consequences

- **Good**: Identity data and authentication processes are now natively handled by Supabase, perfectly aligned with the new database backend.
- **Good**: We reduce dependencies on multiple vendors (Neon for Auth, Supabase for DB).
- **Good**: `@supabase/ssr` provides a robust, standardized way to handle cookies in App Router.
- **Bad**: We have to rewrite the middleware (`proxy.ts`) and some API routes because Supabase uses a different session storage and cookie mechanism compared to Neon Auth.

## Implementation Plan

- **Affected paths**: `src/lib/auth/`, `src/app/api/auth/`, `proxy.ts`, `package.json`
- **Steps**:
  1. Install Supabase packages and remove Neon packages.
  2. Implement `src/lib/auth/providers/supabase.ts` using `@supabase/ssr`.
  3. Refactor `proxy.ts` (middleware) to use Supabase's `getUser` for route protection.
  4. Update `client.ts` to export the browser client.
  5. Refactor the `sign-up` and `sign-in` server actions to use Supabase.

### Verification

- [ ] Project builds without Neon Auth dependencies.
- [ ] Users can sign up via Email/Password and a session is created.
- [ ] Protected routes correctly redirect unauthenticated users to `/auth/sign-in`.
