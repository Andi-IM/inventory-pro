---
status: accepted
date: 2026-06-08
decision-makers: 'User, AI Agent'
---

# Implement Tool Management Module using Server Actions

## Context and Problem Statement

InventoryPro requires a core feature to manage physical tools (alat inventaris). Users need the ability to add, view, update, and delete tools (CRUD operations). The system currently uses Next.js App Router, a Neon Serverless PostgreSQL database, and Bootstrap for the UI. We need to decide on the architecture for implementing the data access and frontend integration for this new module.

Constraints:
- Must use existing Neon database connection (`@neondatabase/serverless`).
- Must align with the Next.js App Router paradigm.
- Must ensure seamless form handling and UI updates.

## Decision

We will implement the Tool Management CRUD operations using Next.js **Server Actions** rather than traditional REST API Routes (`/api/tools`). 

The database schema will be managed directly via SQL (using a `public.tools` table). The data access layer will be encapsulated in `src/lib/tools.ts`, which will be invoked by Server Actions in `src/app/tools/actions.ts`. 

Scope includes basic CRUD:
- Listing tools with a table UI
- Creating new tools via a form
- Viewing tool details
- Updating tool details
- Deleting tools

Non-goals:
- We are *not* building an advanced workflow or booking system in this iteration. This is strictly data management.

### Feature Flagging
The Tool Management feature is gated behind a database-controlled feature flag. The key `tool_management` must be enabled in the `public.feature_flags` table for the feature to be accessible by end users.

## Consequences

- **Good**, because Server Actions eliminate the need to write boilerplate fetch code and manage client-side state for form submissions.
- **Good**, because we can leverage `revalidatePath` to instantly refresh the UI upon data mutation, providing a snappy user experience.
- **Good**, because the data access layer (`src/lib/tools.ts`) remains clean and separated from HTTP routing concerns.
- **Bad**, because Server Actions abstract away traditional HTTP status codes, which might require a different mental model for error handling (returning error objects vs throwing HTTP 4xx).

## Implementation Plan

- **Affected paths**: 
  - Database schema: Add table `public.tools`
  - Data access: `src/lib/tools.ts`
  - Server Actions: `src/app/tools/actions.ts`
  - Frontend Pages: `src/app/tools/page.tsx`, `src/app/tools/new/page.tsx`, `src/app/tools/[id]/page.tsx`, `src/app/tools/[id]/edit/page.tsx`
- **Dependencies**: No new dependencies. Uses existing `pg` (via `@neondatabase/serverless`) and `bootstrap`.
- **Patterns to follow**: 
  - Define SQL queries in `src/lib/tools.ts` using the existing `pool.query` pattern.
  - Handle form submissions natively using Next.js `<form action={...}>` invoking Server Actions.
  - Use Next.js `revalidatePath('/tools')` to clear the cache after updates.
- **Patterns to avoid**: 
  - Do not create `/api/tools/route.ts` REST endpoints for standard CRUD.
  - Avoid client-side `useEffect` for data fetching; use React Server Components (RSC) to fetch data directly in the `page.tsx`.

### Verification

- [x] A `tools` table exists in the Neon database with `id`, `name`, `description`, `status`, `created_at`, `updated_at`.
- [x] Navigating to `/tools` displays the tools list.
- [x] Submitting a new tool via `/tools/new` successfully inserts data to the database and redirects to the list.
- [x] Editing an existing tool correctly updates the database and the UI.
- [x] Deleting a tool correctly removes it from the list.

## Alternatives Considered

- **REST API Routes (`/api/tools/*`)**: Rejected because building separate API endpoints and fetching them via client-side code introduces unnecessary boilerplate in the App Router ecosystem, where Server Actions provide a more cohesive developer experience for forms and mutations.

## More Information

- See `docs/decisions/0002-adopt-nextjs-app-router-bootstrap.md` for context on the Next.js and UI stack.

