---
status: accepted
date: 2026-06-08
decision-makers: Developer, User
---

# Adopt Camunda 7 REST Client

## Context and Problem Statement

Our application needs to communicate with the Camunda Platform 7 workflow engine (CP7) to trigger workflows, list active user tasks, fetch variable values, and complete tasks. We need a clean, type-safe Camunda REST Client in TypeScript that runs on the server side in our Next.js application, configurations for endpoints, standard field mapping to translate between Camunda's schemas and our application schemas, and robust error handling.

## Decision

We will build a custom TypeScript REST client `CamundaClient` in `src/lib/camunda.ts` that:
- Uses the standard Node/Next.js `fetch` API.
- Configures the endpoint via `CAMUNDA_REST_URL` (defaulting to `http://localhost:8080/engine-rest`).
- Performs standard serialization (wrapping variables to `{ value: x }` object notation) when sending data to Camunda.
- Flattens variables (`{ val: { value: x, type: Y } }` into `{ val: x }`) when retrieving them.
- Performs field mapping (e.g., `id` -> `key`, `processInstanceId` -> `processInstanceKey`) to maintain application compatibility.
- Parses REST Exception bodies on error and throws typed exceptions.

## Non-goals
- We are NOT supporting Camunda 8 (Zeebe) in this client.
- We are NOT implementing a full BPMN modeler or process deployment tool in the client.
- We are NOT implementing client-side polling or WebSockets in the initial phase.

## Alternatives Considered
- **Camunda 7 Node.js External Task Client:** Rejected because it is designed for long-polling workers, not for a Request-Response BFF (Backend for Frontend) architecture.
- **Generic HTTP client (Axios):** Rejected to minimize dependencies and use the native `fetch` API which is well-integrated with Next.js caching.
- **Camunda 8 (SaaS/Self-managed):** Rejected because the current project requirements and infrastructure are optimized for Camunda 7's lightweight REST API.

## Consequences

- Good, because the client is lightweight, dependencies-free (only standard fetch), and fully typed.
- Good, because details of Camunda's verbose variable structure and field names are encapsulated in a single file.
- Good, because mapping prevents CP7 schemas from leaking into front-end components.
- Bad, because we have to manually maintain endpoint wrapper methods for any new API functionality.

## Implementation Plan

- **Affected paths**: `src/lib/camunda.ts`, `src/types/camunda.ts`, `.env.local`
- **Dependencies**: None (uses built-in `fetch`)
- **Patterns to follow**:
  - Encapsulate HTTP headers, request creation, and response handling in private methods.
  - Return flattened, application-mapped objects from public methods.
- **Patterns to avoid**:
  - Do not use third-party client wrappers that target Camunda 8 (Zeebe).
  - Do not expose raw Camunda JSON responses directly to the frontend.

### Verification

- [x] Task search matches active tasks and applies mapping correctly.
- [x] Process instance starts and returns mapped `processInstanceKey`.
- [x] Task variables are flattened and fetched successfully.
- [x] Completing a task successfully sends formatted variables to CP7.
- [x] API errors are caught, parsed, and logged cleanly.
