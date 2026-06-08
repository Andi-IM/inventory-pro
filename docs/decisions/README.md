# Architecture Decision Records (ADR)

An Architecture Decision Record (ADR) captures an important architecture decision along with its context and consequences.

## Conventions

- Directory: `docs/decisions/`
- Naming:
  - Use 4-digit incremental integers: `NNNN-filename.md` (e.g., `0001-adopt-architecture-decision-records.md`)
- Status values: `proposed`, `accepted`, `rejected`, `deprecated`, `superseded`

## Workflow

- Create a new ADR as `proposed`.
- Discuss and iterate.
- When the team commits: mark it `accepted` (or `rejected`).
- If replaced later: create a new ADR and mark the old one `superseded` with a link.

## ADRs

- [0001-adopt-architecture-decision-records.md](0001-adopt-architecture-decision-records.md) - Adopt Architecture Decision Records (ADR)
- [0002-adopt-nextjs-app-router-bootstrap.md](0002-adopt-nextjs-app-router-bootstrap.md) - Adopt Next.js with App Router and Bootstrap CSS
- [0003-adopt-camunda-7-rest-client.md](0003-adopt-camunda-7-rest-client.md) - Adopt Camunda 7 REST Client
- [0004-adopt-neon-auth-for-authentication.md](0004-adopt-neon-auth-for-authentication.md) - Adopt Neon Auth for Authentication
- [0005-adopt-playwright-for-e2e-testing.md](0005-adopt-playwright-for-e2e-testing.md) - Adopt Playwright for E2E Testing
- [0006-adopt-dynamic-role-and-permission-based-authorization.md](0006-adopt-dynamic-role-and-permission-based-authorization.md) - Adopt Dynamic Role and Permission-Based Authorization
- [0007-enforce-identity-bound-workflow-integration.md](0007-enforce-identity-bound-workflow-integration.md) - Enforce Identity-Bound Workflow Integration
- [0008-adopt-conventional-commits-and-automated-semantic-versioning.md](0008-adopt-conventional-commits-and-automated-semantic-versioning.md) - Adopt Conventional Commits and Automated Semantic Versioning
- [0009-implement-tool-management-module.md](0009-implement-tool-management-module.md) - Implement Tool Management Module using Server Actions
- [0010-flatten-admin-features-with-flags-and-permissions.md](0010-flatten-admin-features-with-flags-and-permissions.md) - Flatten Admin Features with Feature Flags and Permissions


