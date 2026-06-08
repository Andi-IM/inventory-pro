---
status: accepted
date: 2026-06-08
---
# ADR 0008: Adopt Conventional Commits and Automated Semantic Versioning

## Context and Problem Statement
As the project grows, tracking changes and maintaining a version history has become manual and inconsistent. We lack a standardized way to communicate the impact of changes (features vs. fixes) and a reliable method for generating changelogs. We need an automated system that handles versioning and release notes based on our commit history.

## Decision
We will adopt **Conventional Commits** as our messaging standard and **Semantic Release** for fully automated versioning and changelog generation.

### Key Components:
1. **Commit Message Format**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `chore:`, `docs:`).
2. **Local Enforcement**: Use `husky` and `commitlint` to validate commit messages before they are created.
3. **Automated Release Workflow**: Use `semantic-release` in GitHub Actions to:
    - Determine the next semantic version.
    - Generate/update `CHANGELOG.md`.
    - Create a GitHub Release.
    - Bump the version in `package.json`.

## Non-goals
- We are NOT supporting manual version bumps in the `main` branch.
- We are NOT automating deployment to production as part of *this* decision (this focuses on versioning/release).

## Alternatives Considered
- **Manual Changelog (current):** Rejected as it is error-prone and often forgotten.
- **standard-version (Local):** Rejected because it requires manual execution by a developer, leading to potential inconsistency. `semantic-release` in CI provides a single source of truth.

## Implementation Plan
- **Affected paths**:
  - `package.json`: Add dependencies and configurations.
  - `.github/workflows/ci.yml`: Add release job.
  - `commitlint.config.js`: New configuration file.
  - `.releaserc.json`: New semantic-release configuration.
- **Dependencies**:
  - Dev: `husky`, `@commitlint/config-conventional`, `@commitlint/cli`, `semantic-release`, `@semantic-release/changelog`, `@semantic-release/git`.
- **Patterns to follow**:
  - Commit messages must follow: `<type>[optional scope]: <description>`.
  - Releases only trigger on `main` branch merges.

## Consequences
- **Standardization**: Clear, machine-readable commit history.
- **Automation**: Zero-effort changelogs and version management.
- **Developer Overhead**: Developers must follow the commit convention or their commits will be rejected locally.

## Verification
- [ ] `git commit -m "bad message"` is rejected by husky/commitlint.
- [ ] `git commit -m "feat: valid message"` is accepted.
- [ ] `semantic-release --dry-run` in CI shows correct version calculation.
- [ ] `CHANGELOG.md` is automatically created/updated on merge to `main`.
