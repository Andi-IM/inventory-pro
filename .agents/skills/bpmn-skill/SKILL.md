---
name: bpmn-skill
description: Helps AI to design, explain, and generate BPMN 2.0 diagrams and XML with role-aware symbol usage.
---

# BPMN Skill

## Overview

BPMN (Business Process Model and Notation) is a standardized visual language to describe business processes, participants, and interactions in a way that both business and engineering can read.  
This skill provides role-focused guidance for BPMN symbols so that generated diagrams and BPMN XML are not only syntactically valid but also semantically clear for real-world workflows.

## When to Use This Skill

- Describing business processes, workflows, or SOPs as BPMN diagrams.
- Explaining which BPMN symbols to use for a given process scenario.
- Generating BPMN XML that a workflow engine can potentially parse.
- Distinguishing between orchestration (inside one process) and collaboration (between participants).
- Modeling exceptions, timeouts, and external events using the right BPMN event types.

## Core Concepts

### 1. Symbol Roles (High-level)

- **Participants**
  - **Pool**: Top-level process boundary or independent participant (e.g., Customer vs Company).
  - **Lane**: Responsibility partition inside a pool (e.g., roles, teams, systems).

- **Activities**
  - **Task**: Atomic unit of work (human or system).
  - **Subprocess**: Group of related tasks to hide detail.
  - **Call Activity**: Reusable subprocess shared across different parent processes.
  - **Ad-hoc Subprocess**: Set of tasks with flexible order.
  - **Event Subprocess**: Subprocess triggered by an event while its parent scope is active.

- **Gateways**
  - **Exclusive (XOR)**: Choose exactly one path.
  - **Parallel (AND)**: Run multiple paths in parallel or synchronize them.
  - **Inclusive (OR)**: Activate one or more paths depending on conditions.
  - **Event-based**: Choose the first event that happens (e.g., message vs timer).

- **Events**
  - **Start / Intermediate / End** with different types:
    - Message, Timer, Error, Conditional, Signal, Escalation, Compensation, Link, Terminate, Cancel.
  - **Catching vs Throwing**: waiting for something vs raising/producing something.

- **Artifacts & Data**
  - **Data Object, Data Store**: Represent data used or produced.
  - **Group, Annotation**: Clarify or group parts of the diagram without changing flow.

### 2. Roles of Important Symbols

#### Participants

- **Pool**
  - Use to separate independent participants or organizations.
  - Use in collaboration diagrams to show which process “owns” which workflow.
  - Do not mix sequence flow across pools; use **message flow** instead.

- **Lane**
  - Use to show ownership of tasks (role, department, or system).
  - Keep lanes meaningful; avoid over-fragmenting.

#### Activities

- **Task**
  - Default unit of work. Use typed tasks when relevant:
    - User, Manual, Service, Script, Send, Receive, Business Rule.
  - Keep task labels as “verb + object” (e.g., “Validate Order”).

- **Subprocess**
  - Use when a part of the process is complex and deserves its own mini-diagram.
  - Allows attaching boundary events (error, timer, escalation, etc.).
  - Good for readability and modularity.

- **Call Activity**
  - Use when the same subprocess is reused across multiple parent processes.
  - Requires clear input/output semantics (data mapping).

- **Ad-hoc Subprocess**
  - Use when internal tasks have no strict sequence and can be optional or repeated.
  - Good for creative or knowledge-intensive work.

- **Event Subprocess**
  - Use to handle “side” events that may occur while the parent is running (e.g., cancellation request, external escalation).
  - Can interrupt or run in parallel with the main flow.

#### Gateways

- **Exclusive (XOR)**
  - Use for “pick exactly one” decisions (if/else).
  - Decision logic should be defined before the gateway; the gateway just routes.

- **Parallel (AND)**
  - Use to start parallel work or to join all parallel paths.
  - After splitting, normally have a corresponding join if all paths must complete.

- **Inclusive (OR)**
  - Use when 1..N paths may be active depending on conditions.
  - Be explicit about which combinations are possible; more complex to read.

- **Event-based**
  - Use when routing depends on which event happens first (e.g., reply arrives or timeout fires).
  - Do not mix data-based conditions directly on this gateway; it is event-driven.

#### Events

- **Message Event**
  - For directed communication (sender → specific receiver).
  - Use in collaboration diagrams between pools.

- **Timer Event**
  - For delays, deadlines, schedules, or timeouts.
  - Often used as boundary events to model SLAs and expiry.

- **Error Event**
  - For serious failures that trigger exception flows.
  - Common on boundary of subprocess to separate happy path vs failure path.

- **Conditional Event**
  - For continuing only when a condition becomes true (state-based).

- **Signal Event**
  - For broadcast-style notifications (no single target).
  - Any process listening for that signal can react.

- **Escalation Event**
  - For raising an issue to a higher-level context without treating it as fatal error.
  - Often used from subprocess to parent process.

- **Compensation Event**
  - For business rollback (undo what was successfully done).
  - Used with compensation tasks and associated flows.

- **Link Event**
  - For connecting distant parts of a diagram without long sequence flows.
  - Purely for diagram readability (no business semantics).

- **Terminate End Event**
  - For stopping all active paths within the current process scope immediately.

- **Cancel Event**
  - Only for transaction subprocesses to cancel the transaction semantics.

### 3. Behavior Rules (for the AI)

- Treat **gateway** as a router, not as a “decision task”.
- Use **start event** at least once per process; end events should represent meaningful outcomes (e.g., “Order Completed”, “Order Rejected”).
- Do not cross sequence flows between pools; use **messageFlow** there.
- Use **boundary events** to model exceptions or timeouts on tasks/subprocesses.
- Prefer **subprocess** or **callActivity** over giant flat diagrams.
- For error/escalation/compensation, use event types that match the business semantics, not just the symbol shape.

## Best Practices & Guidelines

- **Clarity first**: Aim for a left-to-right main flow with minimal line crossing.
- **Consistent naming**:
  - Tasks: `Verb + Object` (“Approve Request”, “Send Invoice”).
  - Events: state-based (“Order Received”, “Payment Expired”).
- **Symmetric gateways**: If you split with XOR/AND/OR, merge with the same type unless you intentionally design otherwise.
- **One concern per diagram**: Avoid mixing too many independent variants into a single BPMN model.
- **Separate happy vs exception flow**: Use error/escalation/timer events to route exceptions clearly.

## Modeling Heuristics (Prompts for the AI)

When generating or revising BPMN:

- Ask: *Who* are the participants? Use pools and lanes only if that distinction matters.
- Ask: *What is the main success scenario (happy path)?* Model that first, then add exceptions.
- Ask: *Where are decisions made?* Use XOR/OR gateways for data-based branching, event-based for competing events.
- Ask: *What can go wrong or take too long?* Add boundary events (timer/error/escalation) and event subprocesses as needed.
- Ask: *Can this part be reused or is it conceptually separate?* Consider subprocess or call activity.

## Resources

Detailed guides, templates, and examples live in separate files to keep this skill focused.

### References

- `references/components_guide.md`  
  When to use and not use each gateway, task type, and event, with short examples.
- `references/event_patterns.md`  
  Patterns for timeouts, retries, error flows, escalation, and compensation.
- `references/collaboration_modeling.md`  
  How to model multi-pool collaboration and message flows correctly.

### Templates

- `templates/basic_process_template.bpmn`  
  Minimal valid BPMN XML with one process, start event, tasks, end event.
- `templates/collaboration_template.bpmn`  
  Two pools with message flows between them.
- `templates/service_orchestration_template.bpmn`  
  One pool with lanes for human tasks and service tasks.

### Examples

- `examples/simple_sequential.bpmn`
- `examples/exclusive_gateway_process.bpmn`
- `examples/parallel_review_process.bpmn`
- `examples/event_timeout_process.bpmn`
- `examples/compensation_flow.bpmn`

## How to Generate BPMN XML

When asked to generate BPMN XML:

1. Identify purpose, start condition, and end outcomes of the process.
2. List the main steps in order (happy path).
3. Identify participants and decide whether to use multiple pools and/or lanes.
4. Insert gateways where data-based or event-based decisions exist.
5. Add events for messages, timers, errors, escalations, signals, or compensations where relevant.
6. Map the structure onto a template (e.g., `basic_process_template.bpmn`).
7. Create `<bpmn:task>`, `<bpmn:startEvent>`, `<bpmn:endEvent>`, `<bpmn:subProcess>`, `<bpmn:exclusiveGateway>`, etc. with unique IDs.
8. Wire elements using `<bpmn:sequenceFlow>` with correct `sourceRef` and `targetRef`.
9. If collaboration is present, use `<bpmn:messageFlow>` between pools.
10. Output raw XML in a ```bpmn``` or ```xml``` code block.

## Output Expectations

- The diagram/XML should clearly show the main path and key exceptions.
- Symbol choices must reflect their intended BPMN semantics, not just appearance.
- Gateways and events must be used consistently with their roles.
- The result must be understandable by both a business analyst and a developer familiar with BPMN engines.