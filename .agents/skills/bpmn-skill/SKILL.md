---
name: bpmn-skill
description: Helps AI to create BPMN diagrams.
---

# BPMN Skill

## Overview

BPMN (Business Process Model and Notation) is a standardized visual modeling language used for describing business processes. It bridges the gap between business stakeholders and IT by providing a common language to understand and automate workflows.

## When to Use This Skill

- Documenting, analyzing, and improving business processes
- Communicating process requirements to developers and stakeholders
- Providing a blueprint for process automation
- Ensuring compliance and generating training materials

## Core Concepts

### 1. Key Elements

- **Flow Objects:** Start Event (beginning), End Event (completion), Activity (work being done), Gateway (decision points).
- **Connecting Objects:** Sequence Flow (order of activities), Message Flow (communication between participants), Association.
- **Swimlanes:** Pool (participants in the process), Lane (roles within a participant).
- **Artifacts:** Data Object, Data Store, Group, Annotation.

### 2. Advanced Components (BPMN 2.0 Specifics)

- **Event Types:** Intermediate Events (Timer, Message, Error, Signal, Escalation, Cancel, Compensation, Link, Terminate).
- **Gateway Types:** Exclusive (XOR/Conditional branching), Parallel (AND/Concurrent paths), Inclusive (OR/One or more paths), Event-Based (Triggers based on catching events).
- **Task Types:** User Task (requires human action), Service Task (automated application/service), Send/Receive Task (messaging), Manual Task (non-system human task), Script Task (executes a script), Business Rule Task.
- **Sub-processes:** Embedded Sub-process, Reusable Sub-process (Call Activity), Event Sub-process, Transaction, Ad-Hoc.

### 3. Best Practices & Guidelines

- **Clarity is King**: Keep diagrams clean and easy to read. Typically flow is left to right.
- **Labeling**: Use verb-noun phrases for tasks (e.g., "Process Payment", "Check Inventory"). Keep event labels state-based (e.g., "Order Received").
- **Symmetry in Gateways**: Always split and merge paths using gateways explicitly. Don't merge sequence flows directly into a task without a converging gateway if it's complex.
- **Valid XML**: Ensure IDs are unique. Every `<bpmn:sequenceFlow>` must have matching `sourceRef` and `targetRef` that map to existing element IDs.

## Resources

To save space and keep this guide focused, detailed guides, XML examples, and templates have been extracted to separate files in this skill directory:

### References
- [Components Guide](file:///d:/01_Projects/herts/.agents/skills/bpmn-skill/references/components_guide.md): A detailed guide on when to use (and when NOT to use) specific Gateways, Tasks, and Events, along with their core principles.

### Templates
- [Basic Process Template](file:///d:/01_Projects/herts/.agents/skills/bpmn-skill/templates/basic_process_template.bpmn): A minimal, valid BPMN XML structure you can use as a starting point.

### Examples
- [Simple Sequential Process](file:///d:/01_Projects/herts/.agents/skills/bpmn-skill/examples/simple_sequential.bpmn): A straightforward process with no decisions.
- [Exclusive Gateway Process](file:///d:/01_Projects/herts/.agents/skills/bpmn-skill/examples/exclusive_gateway.bpmn): A process demonstrating conditional branching (if/else) using gateways.

## How to Generate BPMN XML

When asked to generate BPMN, follow these steps:
1. Identify the key participants, if any (Pools/Lanes).
2. Outline the sequence of events and tasks.
3. Identify decision points (Gateways).
4. Use the `basic_process_template.bpmn` as a foundation.
5. Populate `<bpmn:task>`, `<bpmn:startEvent>`, `<bpmn:endEvent>`, and `<bpmn:exclusiveGateway>` elements.
6. Connect them using `<bpmn:sequenceFlow>` with correct `sourceRef` and `targetRef` IDs.
7. Output the raw XML inside a ````bpmn ```` code block.
