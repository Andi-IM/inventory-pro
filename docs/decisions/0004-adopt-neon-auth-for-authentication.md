---
status: accepted
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Neon Auth for Authentication

## Context and Problem Statement

We need to secure our Next.js application by implementing user authentication. We want to support email/password sign-up and sign-in. Since our database is hosted on Neon Postgres, we can leverage Neon Auth (managed authentication based on Better Auth), which stores user/session tables directly in our `neon_auth` database schema and supports database branching.

## Decision

We will adopt Neon Auth for application authentication:
- Install `@neondatabase/auth` package.
- Configure `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` in `.env.local`.
- Create a unified server-side auth instance in `src/lib/auth/server.ts`.
- Create an API route handler in `src/app/api/auth/[...path]/route.ts`.
- Create a client auth helper in `src/lib/auth/client.ts`.
- Secure protected routes (e.g., `/account`) using protective middleware in `proxy.ts`.
- Build custom Sign Up and Sign In pages inside `src/app/auth/` using Next.js Server Actions and Bootstrap CSS for responsive form styling.

## Consequences

- Good, because identity data is co-located with our Postgres database, making user querying and Row Level Security (RLS) easy.
- Good, because authentication state is branched alongside our Postgres database branches.
- Good, because it provides custom form control and integrates seamlessly with Next.js Server Actions.
- Bad, because Neon Auth is currently in Beta, and requires client-side cookie routing.

## Implementation Plan

- **Affected paths**: `src/lib/auth/`, `src/app/api/auth/`, `src/app/auth/`, `proxy.ts`, `package.json`, `.env.local`
- **Dependencies**: `@neondatabase/auth`
- **Patterns to follow**:
  - Implement forms using Bootstrap CSS classes (`container`, `form-control`, `btn-primary`, `alert-danger`).
  - Use server actions for email registration and sign-in handling.
- **Patterns to avoid**:
  - Do not use Tailwind CSS class utilities.

### Verification

- [x] `@neondatabase/auth` package installed successfully.
- [x] Next.js app lints and compiles without type errors.
- [x] Users can sign up via `/auth/sign-up` and their session is initialized (when flag is enabled).
- [x] Users can sign in via `/auth/sign-in`.
- [x] Protected routes are blocked and redirected to sign-in.
