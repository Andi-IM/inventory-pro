---
status: 'accepted'
date: 2026-06-08
decision-makers: 'Andi'
---

# 0014. Migrate Tools Module to Prisma and Isolate Client Components

## Context and Problem Statement

The `tools` module in the `inventory-pro` application was initially implemented using raw SQL queries via a custom `query` function (from `src/lib/db.ts`). This bypassed the standard Prisma ORM used across the rest of the application. As a result, the `public.tools` table was missing from the Prisma schema and the database, causing fatal `relation "public.tools" does not exist` errors when the frontend attempted to fetch data. Furthermore, hardcoded raw SQL queries caused schema mismatches (e.g., UI expecting `created_at` but Prisma generating `createdAt`).

Additionally, within the Next.js App Router, interactive event handlers such as `onClick` were passed directly into Server Components (`src/app/dashboard/tools/[id]/page.tsx`). Next.js strict RSC (React Server Components) rules forbid serializing functions to the client, leading to the error: `Error: Event handlers cannot be passed to Client Component props`.

## Decision

We are explicitly standardizing data access on **Prisma Client** and isolating interactive UI logic into **Client Components**:
1. **Prisma ORM for Tools:** Add the `Tool` model to `schema.prisma` and replace all raw SQL execution in `src/lib/tools.ts` with typed Prisma Client operations (`prisma.tool.findMany`, `prisma.tool.create`, etc.).
2. **Client Component Isolation:** Remove direct `onClick` event handlers from Server Component layouts. Instead, extract small, focused interactive pieces (such as a delete confirmation dialog) into dedicated Client Components marked with `"use client"` (e.g., `DeleteButton.tsx`).

## Consequences

- Good, because we achieve complete end-to-end type safety for the `Tool` entity and eliminate runtime errors related to missing tables and incorrect property names (`created_at` vs `createdAt`).
- Good, because page layouts remain purely server-rendered, and React hydration errors regarding event handlers are entirely resolved.
- Good, because database schema migrations for Tools are now tracked via Prisma instead of requiring manual raw SQL setup scripts.
- Bad, because there is slightly more component fragmentation (e.g., creating `DeleteButton.tsx` solely to handle a `window.confirm` browser dialog).

## Implementation Plan

- **Affected paths**: 
  - `prisma/schema.prisma`
  - `src/lib/tools.ts`
  - `src/app/dashboard/tools/page.tsx`
  - `src/app/dashboard/tools/[id]/page.tsx`
  - `src/app/dashboard/tools/DeleteButton.tsx` (new)
  - `proxy.ts` (routing fix)
- **Dependencies**: No new dependencies. Prisma and Next.js are already present.
- **Patterns to follow**: Always use Prisma Client (`prisma.<model>`) for database queries. Always extract interactive event handlers (`onClick`, `onChange`, `confirm()`) into separate files with a `'use client'` directive.
- **Patterns to avoid**: Do NOT use the raw `query()` from `src/lib/db.ts` for entities that can be modeled in Prisma. Do NOT place `onClick` directly on JSX elements inside `async function Page()` server components.

### Verification

- [x] `Tool` model is present in `schema.prisma` and successfully pushed to the database.
- [x] `npm run typecheck` passes without TypeScript errors.
- [x] Application can successfully load `/dashboard/tools` without Prisma runtime errors.
- [x] Client side features (e.g., `window.confirm` deletion popup) function correctly without triggering Next.js RSC errors.
