# NextHerts Boilerplate

A modern Next.js 16 (App Router) enterprise-grade boilerplate integrated with **Bootstrap CSS**, **Neon Auth** (managed Better Auth), a custom **Camunda 7 REST Client**, and a **dynamic database-driven authorization (RBAC + Fine-grained permission) system**.

---

## 🚀 Key Features

* **Authentication**: Seamless email/password registration and login handled via managed Neon Auth.
  - Sign-ups are controlled by a code-level feature flag (`NEXT_PUBLIC_ALLOW_SIGN_UP`).
  - Protected routes (e.g., `/account`) are secured using a Next.js 16-compatible middleware proxy (`proxy.ts`).
* **Dynamic Authorization**: An advanced, database-controlled Role-Based Access Control (RBAC) and fine-grained user permission system:
  - Base roles: `superuser`, `operator`, and `peminjam`.
  - Custom overrides and role capability mappings can be adjusted at runtime without redeployments.
  - Features system-wide feature flags managed dynamically in the database.
* **Superuser Admin Panel**: A dedicated administrative dashboard at `/admin` (layout-protected) to manage registered users, customize role default permissions, assign user overrides, and toggle feature flags.
* **Bootstrap CSS Styling**: Clean and premium responsive styling using Bootstrap 5.3. Loaded dynamically via a client hydration wrapper to prevent SSR hydration mismatches.
* **Camunda 7 Client**: A lightweight, dependency-free TypeScript REST client (`src/lib/camunda.ts`) mapping engine schemas, process triggers, active task checks, and variable flattening.
* **E2E & Unit Test Suites**: E2E tests using Playwright simulating browser interactions, alongside mockable Vitest unit/integration tests.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16.2.7 (App Router)
* **Language**: TypeScript (strict rules, `eslint` configured)
* **Styling**: Bootstrap 5.3.8
* **Database Driver**: `@neondatabase/serverless` (connection pooling ready)
* **Auth SDK**: `@neondatabase/auth` (Better Auth backend)
* **Testing**: Playwright (E2E) & Vitest (Unit/Integration)

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local` in the root directory and configure the required environment variables:

```bash
cp .env.example .env.local
```

---

## 🔌 Database Seeding

The project includes a tracked database seeding script `seed.js` to create tables and populate default users and permissions.

Run the seeding script:
```bash
node seed.js
```

This script will:
1. Create the custom authorization tables in the database schema:
   - `public.feature_flags`
   - `public.role_permissions`
   - `public.user_permissions`
2. Seed initial feature flags (`loan_module`, `user_management`) and default role-permission maps.
3. Automatically register three default users via the Neon Auth API:
   - **Super User**: `superuser@example.com` (Role: `superuser`, Password: `Password123!`)
   - **Operator User**: `operator@example.com` (Role: `operator`, Password: `Password123!`)
   - **Peminjam User**: `peminjam@example.com` (Role: `peminjam`, Password: `Password123!`)

### Promoting Users
You can promote any existing registered user to the `superuser` role by passing their email as an argument to the seeding script:
```bash
node seed.js user@example.com
```

---

## 🧪 Running Tests

### Unit & Integration Tests (Vitest)
Unit and integration tests are executed using Vitest. Environment variables are loaded automatically into worker threads during test runs via configuration.
```bash
npm test
```
*Note: Playwright E2E tests are excluded from the Vitest search path in `vitest.config.ts`.*

### E2E Tests (Playwright)
To execute browser-based E2E tests simulating layout interactions, form errors, and feature flag enforcement:
```bash
npm run test:e2e
```
*Note: E2E tests run against Chromium and automatically spin up or reuse the Next.js dev server.*

### Code Quality (ESLint)
```bash
npm run lint
```

---

## 📂 Architecture Decisions (ADR)

All key design decisions are documented and tracked in the Architecture Decision Records (ADRs) inside the [docs/adr/](file:///d:/01_Projects/next-herts/docs/adr/) directory.
