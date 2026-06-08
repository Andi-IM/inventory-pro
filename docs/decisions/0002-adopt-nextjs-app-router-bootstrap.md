---
status: accepted
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Next.js with App Router and Bootstrap CSS

## Context and Problem Statement

We are starting a new web application (`next-herts`). We need a modern, scalable web framework with good routing, rendering, and SEO performance out of the box, as well as a robust styling system. Tailwind CSS is not preferred for this project; instead, Bootstrap CSS is requested for UI design and responsive grids. We need to bootstrap this codebase in a clean, maintainable structure.

## Decision

We will use Next.js as the core application framework, utilizing the modern App Router, TypeScript, and ESLint. We will explicitly configure it to use a `src/` directory structure.
For styling, we will adopt Bootstrap CSS. Tailwind CSS will be disabled.
Bootstrap JavaScript (which requires a client browser context) will be loaded dynamically using a custom `<BootstrapClient />` component to ensure compatibility with Next.js App Router's SSR.

## Consequences

- Good, because Next.js App Router provides excellent performance, built-in routing, and SEO best practices.
- Good, because Bootstrap CSS provides a fast, familiar grid system and styling components without writing custom CSS from scratch.
- Good, because TypeScript adds static typing for increased reliability.
- Bad, because Bootstrap requires additional client-side hydration setup for its JavaScript features, and is a larger bundle size compared to utility CSS.

## Implementation Plan

- **Affected paths**: Root workspace, `src/`, `package.json`
- **Dependencies**: `next`, `react`, `react-dom`, `bootstrap`
- **Patterns to follow**:
  - Dynamically load Bootstrap JS on the client inside a client component to prevent SSR environment crashes.
  - Import Bootstrap CSS directly in the root layout file.
- **Patterns to avoid**:
  - Do not use Tailwind CSS.
  - Do not load Bootstrap JS synchronously in a Server Component context.

### Verification

- [x] Next.js app bootstrapped and starts successfully via dev server.
- [x] Bootstrap packages installed (`bootstrap`).
- [x] Bootstrap CSS loaded successfully and styled button elements render as expected.
- [x] Bootstrap Client component created and imported without SSR warnings.

## Alternatives Considered

- **Next.js with Tailwind CSS**: Rejected because the user specifically requested Bootstrap CSS.
- **Next.js with Vanilla CSS**: Rejected because Bootstrap CSS provides a much richer set of pre-built components and grid helpers, accelerating UI development.
