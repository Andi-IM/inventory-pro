---
status: accepted
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Architecture Decision Records (ADR)

## Context and Problem Statement

When building software, important architectural decisions are made. Without documentation, the context and rationale behind these decisions are easily lost over time, leading to technical debt, confusion, and inconsistent implementations when new team members or AI agents join the project. We need a lightweight, structured way to document and track decisions.

## Decision

We will adopt the lightweight Architecture Decision Records (ADR) practice.
All architectural decisions will be stored as Markdown files in the `docs/decisions/` directory.
We will use 4-digit incremental integers: `NNNN-filename.md` (e.g., `0001-adopt-architecture-decision-records.md`).
Status values will track the lifecycle: `proposed`, `accepted`, `rejected`, `deprecated`, or `superseded`.

## Consequences

- Good, because decisions are documented in version control next to the code.
- Good, because context, alternatives, and implementation plans are explicit.
- Good, because it provides clear instructions and guardrails for human developers and future AI coding agents.
- Bad, because it adds minor overhead when introducing major architectural changes.

## Implementation Plan

- **Affected paths**: `docs/decisions/`
- **Dependencies**: None
- **Patterns to follow**: Standard MADR or simple markdown templates.
- **Patterns to avoid**: Undocumented or ad-hoc system changes.

### Verification

- [x] Directory `docs/decisions/` created.
- [x] Initial `README.md` index created.
- [x] First ADR added to the index.
