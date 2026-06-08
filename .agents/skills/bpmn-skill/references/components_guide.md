# BPMN 2.0 Components Guide: Usage & Principles

This guide details the specific components of BPMN 2.0, explaining when to use them, when to avoid them, and the core principles to follow.

## 1. Gateways
Gateways control the divergence (splitting) and convergence (merging) of sequence flow.

### Exclusive Gateway (XOR)
- **When to use**: When the process flow must take exactly ONE path based on a condition (e.g., "Approved" vs "Rejected").
- **When NOT to use**: When multiple paths can be executed simultaneously.
- **Principles**: Always provide a default path to prevent process deadlocks if no conditions are met.

### Parallel Gateway (AND)
- **When to use**: When multiple paths must be executed concurrently.
- **When NOT to use**: When paths are mutually exclusive or conditional.
- **Principles**: Always use a matching merging Parallel Gateway to synchronize concurrent paths before moving to the next task. Never place conditions on outgoing flows.

### Inclusive Gateway (OR)
- **When to use**: When one or more paths can be taken based on conditions (e.g., a customer orders A, B, or both).
- **When NOT to use**: If only one path is ever possible (use Exclusive).
- **Principles**: Must have a corresponding merging Inclusive Gateway to synchronize the active paths. Ensure at least one condition will evaluate to true.

### Event-Based Gateway
- **When to use**: When the branching decision is not made by process data, but by waiting for external events (e.g., waiting for either a "Customer Reply Message" or a "7-Day Timer" to expire).
- **Principles**: Must only be followed by Intermediate Catching Events (like Message or Timer). It cannot be followed directly by a Task.

## 2. Task Types
Tasks represent atomic work within a process.

### User Task
- **When to use**: When a human actor needs to perform work using a software application (e.g., filling a form, approving a request).
- **When NOT to use**: For manual physical work not tracked in the system.
- **Principles**: Always specify the assignee, role, or group responsible.

### Service Task
- **When to use**: When the system executes an automated task (e.g., calling an API, sending an automated email, updating a database) without human intervention.
- **Principles**: Must be idempotent where possible.

### Script Task
- **When to use**: For internal data transformation or simple scripts executed directly by the process engine.
- **When NOT to use**: For complex business logic. Complex logic should be offloaded to Service Tasks.

### Manual Task
- **When to use**: For physical work done without any software system interaction (e.g., loading a physical truck, signing a paper document).
- **Principles**: Engine will pass through this task immediately without waiting, as it cannot track physical real-world status.

### Business Rule Task
- **When to use**: When an external Business Rules Engine (like DMN) is invoked to make a complex decision.

## 3. Events
Events represent something that happens during the process.

### Message Event
- **When to use**: To trigger a process from an external participant/system, or to send/receive messages during the process.
- **When NOT to use**: To communicate between tasks within the same Pool. (Use Sequence Flow instead).
- **Principles**: Messages cross Pool boundaries.

### Timer Event
- **When to use**: To delay a process (e.g., wait 24 hours), trigger a process periodically, or set a deadline.
- **Principles**: Often attached to the boundary of a task to create a timeout mechanism (e.g., if User Task is not completed in 3 days, trigger escalation).

### Error Event
- **When to use**: To handle business exceptions (e.g., "Item out of stock" or "Payment failed").
- **When NOT to use**: For normal conditional flow. Do not use for expected business logic paths (use Exclusive Gateways for those).
- **Principles**: Typically attached to the boundary of a task or sub-process to catch errors and route the process to a fallback or compensation path.
