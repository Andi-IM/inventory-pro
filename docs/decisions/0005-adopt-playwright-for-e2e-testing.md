---
status: accepted
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Playwright for E2E Testing

## Context and Problem Statement

We need automated, browser-based end-to-end (E2E) testing to simulate and verify our user authentication flows (registration/sign-up and login/sign-in) under real-world conditions. This ensures that client-side Bootstrap components, forms, validation, and Next.js 16 Server Actions work seamlessly together.

## Decision

We will adopt Playwright for E2E testing:
- Install `@playwright/test` as a devDependency.
- Target the Chromium browser only to keep test execution lightweight and fast.
- Create a Playwright configuration file `playwright.config.ts` in the project root.
- Configure Playwright to spin up the Next.js dev server on a separate port (`3001` or similar) using `webServer` during test execution to prevent port conflicts with active dev servers.
- Place E2E tests in the `e2e/` directory at the project root.
- Add E2E runner scripts in `package.json` (`test:e2e`).
- Add Playwright's local cache/report folders to `.gitignore`.

## Consequences

- Good, because E2E tests run in a real browser, capturing client-side state, redirects, and forms validation accurately.
- Good, because targeting only Chromium keeps dependencies and runtimes minimal.
- Good, because automatic server startup/shutdown reduces runner orchestration overhead.
- Bad, because it adds new dependencies and browser binaries.

## Implementation Plan

- **Affected paths**: `package.json`, `.gitignore`, `playwright.config.ts`, `e2e/`
- **Dependencies**: `@playwright/test`
- **Patterns to follow**:
  - Store Playwright cache and test artifacts in `.gitignore`.
  - Use standard Playwright `expect` assertions.
- **Patterns to avoid**:
  - Do not run E2E tests against the production database without sandboxing or cleanup.

### Verification

- [x] `@playwright/test` installed successfully.
- [x] `.gitignore` updated with Playwright cache/report/results folders.
- [x] `playwright.config.ts` configured with Chromium-only project and `webServer`.
- [x] E2E test `e2e/auth.spec.ts` implemented and executing successfully against a test dev server.
