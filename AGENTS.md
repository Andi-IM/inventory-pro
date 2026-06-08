<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Development Rules

## Branching Strategy
- **Main Branch (`main`):** The stable branch. NEVER push directly to `main`.
- **Feature Branches:** All development must happen on feature branches.
- **Naming Convention:** Use `feature/` for new features, `fix/` for bug fixes, and `refactor/` for code improvements (e.g., `feature/add-login-page`).
- **Workflow:**
    1. Create a feature branch from `main`.
    2. Commit changes to the feature branch.
    3. Open a Pull Request (PR) to merge into `main`.
    4. Pass all CI/CD checks (Lint, Unit Tests, Build, E2E Tests).
    5. Merge PR after approval.

## CI/CD Standards
- Every PR must pass the GitHub Actions pipeline defined in `.github/workflows/ci.yml`.
- Ensure `npm run lint`, `npm run test`, and `npm run build` pass before requesting a review.
- Playwright E2E tests must pass for UI-related changes.
