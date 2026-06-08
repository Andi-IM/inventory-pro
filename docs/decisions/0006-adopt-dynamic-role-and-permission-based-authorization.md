---
status: accepted
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Dynamic Role and Permission-Based Authorization

## Context and Problem Statement

We need a flexible, robust, and dynamic authorization system. The application has base roles such as **Operator** (Admin/Reviewer) and **Peminjam** (Borrower). However, certain features require fine-grained access control. Creating a rigid role for every single combination of permissions is unscalable. Additionally, superusers must be able to manage feature flags and role capabilities at runtime without deploying new code.

## Decision

We will adopt a dynamic, database-driven Role-Based Access Control (RBAC) and permission override system:
- **Base Role Storage**: Store base roles directly in the existing `role` column of the `neon_auth.user` table.
- **Database Tables**: Create three tables in the `public` database schema:
  - `public.feature_flags` (`key` VARCHAR PRIMARY KEY, `enabled` BOOLEAN): Application-controlled feature toggles.
  - `public.role_permissions` (`role` VARCHAR, `permission` VARCHAR, PRIMARY KEY (`role`, `permission`)): Maps default capabilities to roles.
  - `public.user_permissions` (`user_id` VARCHAR, `permission` VARCHAR, PRIMARY KEY (`user_id`, `permission`)): Overrides/adds specific capabilities for a single user.
- **Authorization Resolution**: A user is authorized for a specific permission if:
  - Their role is `superuser`.
  - OR their base role has that permission in `role_permissions`.
  - OR they are directly assigned that permission in `user_permissions`.
- **Admin Management Console**: Build a `/admin` management panel styled with Bootstrap CSS to allow superusers to manage users, update user roles, assign user-specific permissions, customize role-to-permission mappings, and toggle feature flags.
- **Helper Utilities**: Provide helper functions in `src/lib/auth/authorization.ts` that can be run on the server to check permissions in Next.js Server Components, Server Actions, and Route Handlers.

## Non-goals
- We are NOT implementing group-based permissions (only individual user and role-based) in the first phase.
- We are NOT implementing an external Policy Decision Point (PDP) or using a dedicated authorization service.
- We are NOT supporting attribute-based access control (ABAC) yet.

## Alternatives Considered
- **CASL:** Rejected to avoid introducing a complex library for what can be achieved with simple SQL queries against our existing Postgres instance.
- **Hardcoded Flags:** Rejected as it doesn't allow for runtime changes without redeploying code.
- **Auth0 / Okta RBAC:** Rejected to keep authorization logic close to our data and avoid external service costs and latency.

## Consequences

- Good, because capabilities can be modified at runtime without rebuilding or redeploying the application.
- Good, because fine-grained overrides can be granted to individual users without creating a new "role" for each permutation.
- Good, because admin capabilities are centralized in clean tables.
- Bad, because it introduces additional database queries during permission checks, requiring caching or optimized lookups.

## Implementation Plan

- **Affected paths**: `src/lib/auth/`, `src/app/admin/`, `proxy.ts`, `docs/decisions/`
- **Dependencies**: none (uses PG client or existing database capabilities)
- **Patterns to follow**:
  - Run database queries using our Neon Postgres database.
  - Encapsulate permission check logic in reusable server functions.
  - Style admin views using only Bootstrap CSS.
- **Patterns to avoid**:
  - Do not use Tailwind CSS for the admin dashboard.
  - Do not expose administrative endpoints or pages to unprivileged roles.

### Verification

- [x] Database tables `public.feature_flags`, `public.role_permissions`, and `public.user_permissions` created.
- [x] Authorization helpers implemented in `src/lib/auth/authorization.ts`.
- [x] Integration and unit tests covering permission checks written and passing.
- [x] Admin management pages for superusers implemented under `src/app/admin/` and protected.
