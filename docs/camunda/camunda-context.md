# Camunda REST Client - Context & Documentation

## Overview

This document describes the language-agnostic design and implementation of a Camunda REST Client for interacting with Camunda Platform 7 workflow engine. The client provides a standardized interface to manage process instances, user tasks, and workflow variables through the Camunda 7 REST API.

## Core Concepts

### Camunda Platform 7 (CP7)
Camunda Platform 7 is a lightweight, monolithic workflow engine that runs efficiently on PostgreSQL (~1.5GB RAM requirement). It uses HTTP REST APIs for all interactions.

### REST API Base URL
- **Default**: `http://localhost:8080/engine-rest`
- **Environment Variable**: `CAMUNDA_REST_URL`

---

## Client Architecture

### Design Principles
1. **Language Agnostic**: Based on standard HTTP REST principles
2. **Stateless**: Each request is independent
3. **JSON Payloads**: All data exchanged in JSON format
4. **Idempotent Operations**: Safe to retry where applicable

### Core Components
1. **Base URL Configuration**: Centralized endpoint configuration
2. **Request Headers**: Standardized content type headers
3. **Endpoint Wrappers**: High-level methods for common operations
4. **Field Mapping**: Consistent data transformation between CP7 and application formats
5. **Error Handling**: Standardized error propagation and logging

---

## API Endpoints

### 1. Search User Tasks
Search for active user tasks with optional filtering.

**Endpoint**: `POST /task`

**Request Payload**:
```json
{
  "processDefinitionKey": "process_pengajuan",
  "active": true,
  "assignee": "john_doe",
  "candidateGroups": ["group1", "group2"]
}
```

**Field Mapping (CP7 → Application)**:
| Camunda 7 Field | Application Field | Description |
|-----------------|-------------------|-------------|
| `id` | `key`, `userTaskKey` | Task unique identifier |
| `name` | `name` | Task display name |
| `taskDefinitionKey` | `elementId` | BPMN task definition ID |
| `processInstanceId` | `processInstanceKey` | Process instance identifier |
| `formKey` | `formKey`, `externalFormReference` | Associated form reference |
| `created` | `creationDate`, `creationTime` | Task creation timestamp |

---

### 2. Start Process Instance
Initiate a new workflow instance.

**Endpoint**: `POST /process-definition/key/{process_definition_id}/start`

**Request Payload**:
```json
{
  "variables": {
    "variableName": {
      "value": "variableValue"
    }
  }
}
```

**Response**:
```json
{
  "id": "process-instance-id",
  "definitionId": "process-definition-id"
}
```

**Field Mapping**:
| Camunda 7 Field | Application Field |
|-----------------|-------------------|
| `id` | `processInstanceKey`, `id` |

---

### 3. Get User Task
Retrieve details of a specific user task.

**Endpoint**: `GET /task/{task_key}`

**Response**: Same field mapping as Search User Tasks.

---

### 4. Get Task Variables
Fetch variables associated with a user task.

**Endpoint**: `GET /task/{task_key}/variables`

**Response Format (CP7)**:
```json
{
  "variable1": {
    "value": "value1",
    "type": "String"
  },
  "variable2": {
    "value": 42,
    "type": "Integer"
  }
}
```

**Application Format (Flattened)**:
```json
{
  "variable1": "value1",
  "variable2": 42
}
```

---

### 5. Complete User Task
Mark a task as completed with optional variables.

**Endpoint**: `POST /task/{task_key}/complete`

**Request Payload**: Same format as Start Process Instance.

---

## Standard Headers

All requests must include:
```http
Content-Type: application/json
```

---

## Error Handling

### HTTP Status Codes
| Status Code | Meaning |
|-------------|---------|
| 200-299 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "type": "RestException",
  "message": "Error description"
}
```

---

## Implementation Examples (Language Agnostic)

### Initialize Client
```
// Pseudocode
client = CamundaRestClient(base_url = "http://localhost:8080/engine-rest")
```

### Search Tasks
```
// Pseudocode
tasks = client.search_user_tasks(
    state = "CREATED",
    assignee = "john_doe",
    candidate_groups = ["approvers"]
)
```

### Start Process
```
// Pseudocode
variables = {
    "requesterName": "John Doe",
    "itemName": "Laptop",
    "quantity": 1
}

result = client.start_process_instance(
    process_definition_id = "process_pengajuan",
    variables = variables
)
```

### Complete Task
```
// Pseudocode
variables = {
    "isApproved": true,
    "approvalNotes": "Approved for use"
}

client.complete_user_task(
    task_key = "task-123",
    variables = variables
)
```

---

## BPMN Requirements

### Target Platform
- Camunda Platform 7 (version 7.20.0+)
- History Time To Live (TTL) required: `camunda:historyTimeToLive="180"`

### Expression Language
- Use UEL (Unified Expression Language) syntax: `${variable == value}`
- Not FEEL (Friendly Enough Expression Language)

### Task Configuration
- User Tasks: `camunda:formKey="..."`
- External Service Tasks: `camunda:type="external" camunda:topic="..."`

---

## Data Flow Diagram

```
┌──────────────┐         ┌─────────────────────┐         ┌──────────────────┐
│  Application │         │  CamundaRestClient  │         │  Camunda Engine  │
│   (Frontend) │         │    (Middleware)     │         │   (REST API)     │
└──────┬───────┘         └──────────┬──────────┘         └────────┬─────────┘
       │                            │                               │
       │─── Request Action ────────>│                               │
       │                            │─── HTTP Request ─────────────>│
       │                            │                               │
       │                            │<─── JSON Response ────────────│
       │<─── Mapped Response ───────│                               │
       │                            │                               │
```

---

## Key Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| Use Camunda 7 instead of 8 | Resource efficiency (1.5GB vs 6-8GB RAM) |
| REST API instead of gRPC | Simpler implementation, wider language support |
| Field mapping layer | Maintains backward compatibility with existing application |
| Process definition filter | Avoids loading demo tasks from Camunda container |
| UEL expressions | CP7 native expression language |

---

## Security Considerations

- No Keycloak/Camunda Identity integration (handled by application layer)
- Authentication and authorization managed by backend
- No secrets exposed in API requests

---

## Testing & Verification

### Validation Checklist
1. [ ] Task search returns only application-specific tasks
2. [ ] Process instance starts successfully
3. [ ] Task variables are correctly retrieved and flattened
4. [ ] Task completion updates workflow state
5. [ ] Error handling works for invalid requests

---

## References

- [Camunda 7 REST API Documentation](https://docs.camunda.org/manual/latest/reference/rest/)
- [Camunda 7 BPMN Reference](https://docs.camunda.org/manual/latest/reference/bpmn20/)

