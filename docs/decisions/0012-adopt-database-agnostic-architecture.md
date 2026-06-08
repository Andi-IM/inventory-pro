---
status: proposed
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Database Agnostic Architecture

## Context and Problem Statement

The application currently relies heavily on NeonDB and `@neondatabase/auth` for data storage and authentication. This creates tight coupling to a single provider, making it difficult to switch to an alternative backend like Supabase without breaking the entire Next.js system. We need an architecture that abstracts database queries and authentication to allow for seamless backend swapping.

## Decision

We will adopt a database-agnostic architecture:
- Introduce **Prisma ORM** for database interaction, which will abstract raw SQL queries and schema differences across providers.
- Implement the **Auth Adapter Pattern** by defining an `AuthService` interface, replacing direct calls to Neon Auth with an adapter mechanism (`NeonAuthAdapter` and `SupabaseAuthAdapter`).
- Select the active provider at runtime via environment variables (e.g., `AUTH_PROVIDER=supabase`).

## Consequences

- **Good**: We can switch from NeonDB to Supabase (or any Postgres-compatible backend supported by Prisma) by updating environment variables and running Prisma migrations.
- **Good**: Database schema logic will reside within the application (via Prisma) rather than being reliant on vendor-specific schemas (e.g., `neon_auth.user`).
- **Bad**: Refactoring requires replacing existing direct query implementations and Neon Auth calls with Prisma and the new Auth Adapters.
- **Bad**: We introduce the overhead of managing Prisma schemas and migrations.

## Implementation Plan

- **Affected paths**: `src/lib/db.ts`, `src/lib/auth/`, `src/app/users/actions.ts`, `src/lib/auth/authorization.ts`
- **Steps**:
  1. Install `prisma` and `@prisma/client`.
  2. Define the application schema in `prisma/schema.prisma` (including the User model).
  3. Create an `AuthAdapter` interface and implement provider-specific logic in `src/lib/auth/providers/`.
  4. Refactor existing raw SQL queries to use Prisma client queries.

### Verification

- [ ] `npx prisma migrate dev` generates schema successfully in both Neon and Supabase databases.
- [ ] Users can log in when `AUTH_PROVIDER` is set to `neon`.
- [ ] Users can log in when `AUTH_PROVIDER` is set to `supabase`.
