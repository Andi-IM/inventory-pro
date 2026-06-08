---
status: accepted
date: 2026-06-08
decision-makers: 'User, AI Agent'
---

# Flatten Admin Features with Feature Flags and Permissions

## Context and Problem Statement

Initially, administrative modules (User Management, Role Management, Feature Flags Management) were hidden inside a dedicated `/admin` folder route. This created a monolithic "Admin Console" paradigm. As the application grows, we want to transition to a more granular, feature-driven architecture where modules sit at the root level and access is strictly governed by a combination of **Feature Flags** (for global toggling) and **Role-based Permissions** (for user-level access).

## Decision

We will remove the `src/app/admin` folder entirely and elevate its contents to top-level routes (`/users`, `/roles`, `/flags`). 

Access to these routes will be guarded by two layers:
1. **Feature Flags**: Each module will have a corresponding feature flag (`user_management`, `role_management`, `flag_management`). If the flag is disabled, the module is inaccessible (returns 404) to everyone *except* the `superuser`.
2. **Permissions**: Even if a feature flag is enabled, a user must possess the specific permission (e.g., `user:manage`, `role:manage`, `flag:manage`) or be a `superuser` to view and interact with the module.

This flattens the architecture, making every feature a first-class citizen governed by explicit rules rather than arbitrary directory structures.

## Consequences

- **Good**, because the application structure is flatter, easier to navigate, and modular.
- **Good**, because access control is fine-grained; we can grant an `operator` access to `user_management` without giving them access to `flag_management`.
- **Bad**, because it requires checking both feature flags and user permissions on every route, slightly increasing overhead (which is mitigated by caching and server-side checks).

## Implementation Plan

- **Affected paths**: 
  - Move `src/app/admin/users` -> `src/app/users`
  - Move `src/app/admin/roles` -> `src/app/roles`
  - Move `src/app/admin/flags` -> `src/app/flags`
  - Delete `src/app/admin`
  - Update navigation in `src/app/page.tsx`
- **Dependencies**: No new dependencies.
- **Patterns to follow**: 
  - Each top-level module MUST have a `layout.tsx` that checks `isFeatureEnabled(flag, userId)` and `hasPermission(userId, permission)`.
  - Superuser bypasses these checks dynamically inside `isFeatureEnabled` and `hasPermission`.

### Verification

- [x] `/admin` returns a 404 Not Found.
- [x] Users with `operator` role and `user:manage` permission can access `/users` but not `/roles`.
- [x] Superuser can access all modules regardless of feature flag status.

