---
status: accepted
date: 2026-06-08
---
# ADR 0007: Enforce Identity-Bound Workflow Integration

## Context
The application integrates with Camunda 7 via its REST API (`/engine-rest`) as a workflow engine (refer to [ADR 0003](0003-adopt-camunda-7-rest-client.md)).

Previously, the BFF (Backend for Frontend) could query Camunda without strictly filtering by identity. This posed a severe security risk:
1. **Data Leakage:** Users could potentially see tasks assigned to other users or roles by manipulating query parameters or accessing direct task IDs.
2. **Unauthorized Manipulation:** Users could complete or claim tasks they were not authorized for, leading to unauthorized workflow advancement.

To maintain system integrity and data privacy, we must ensure that every interaction with the workflow engine is strictly bound to the authenticated user's identity context.

## Decision
We will enforce identity-bound workflow integration by strictly binding the logged-in user's identity context to every Camunda 7 REST API call.

## Non-goals
- We are NOT implementing a full custom IAM (Identity and Access Management) system.
- We are NOT using Camunda's internal Authorization Service (which requires complex LDAP/database synchronization).
- We are NOT enforcing identity at the network level (e.g., via MTLS); we are enforcing it at the application client level.

## Alternatives Considered
- **Process-level Authorization in Camunda:** Rejected because it requires maintaining a duplicate set of users/groups inside Camunda's identity database or setting up LDAP/SSO sync, which adds significant architectural complexity.
- **Middleware-level Filtering:** Rejected because ensuring 100% coverage across all dynamic routes is more error-prone than enforcing identity at the `CamundaClient` entry point.

## Implementation Plan
- **Affected paths**:
  - `src/lib/camunda.ts`: Core `CamundaClient` logic.
  - `src/types/camunda.ts`: Shared types for identity and filters.
  - `src/lib/camunda.test.ts`: Unit tests for authorization logic.
- **Patterns to follow**:
  - The `CamundaClient` constructor must require a `userId` and `roles` array.
  - All "search" methods must inject an `orQueries` array containing the user's identity filters.
  - All "get" or "action" methods must perform a "pre-flight" check or include identity filters in the request body/URL.
- **Patterns to avoid**:
  - Do NOT allow instantiating a "privileged" or "system" `CamundaClient` in the BFF unless explicitly allowed for specific background jobs (none currently identified).

## Consequences
- **Security:** Significantly reduces the risk of unauthorized task access and manipulation.
- **Privacy:** Ensures users only see data relevant to their assigned tasks.
- **Auditability:** Provides a clear trace of process initiation and task completion.
- **Development Overhead:** Developers must now retrieve the session context (user ID and role) before instantiating the `CamundaClient` in server actions or layouts.
- **Performance:** Slight overhead in task retrieval due to additional authorization checks (especially when checking candidate status for individual tasks).

## Verification
- [x] `CamundaClient` constructor throws if `userId` is missing.
- [x] `searchUserTasks` unit test confirms `orQueries` includes `assignee` and `candidateGroups`.
- [x] `getUserTask` unit test confirms it returns `null` or throws 403 if the user is not authorized.
- [x] `completeUserTask` unit test confirms it prevents completion if the `userId` does not match the assignee.
- [x] `startProcessInstance` unit test confirms `initiator` variable is present in the request payload.
