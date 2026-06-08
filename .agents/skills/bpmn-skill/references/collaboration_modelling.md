# Collaboration Modeling

This guide explains how to model collaboration in BPMN 2.0 correctly, especially when processes involve more than one participant. Its primary focus is to distinguish between orchestration within a single pool and collaboration between pools, and then to explain when to use pools, lanes, message flows, collapsed pools, and communication patterns between parties.

## Core Concepts

In BPMN, a **pool** represents a high-level participant and the boundary of process control. Camunda describes a pool as a "conductor" that holds control over process orchestration, whereas lanes are nested within the pool to divide responsibilities among roles, people, departments, or systems.

Modeling within a single pool is called **orchestration** because there is a single context of process control managing the activities inside it. Conversely, when two or more independent participants interact by exchanging messages, BPMN models this as **collaboration** with multiple pools connected to each other via message flows.

## When to Use Collaboration

Use collaboration modeling when:

- There are two or more independent participants, such as customers, vendors, partners, or external systems.
- Each participant has their own internal process.
- The main interaction occurs through message exchanges, requests, confirmations, inquiries, or notifications.
- You want to show who sends what to whom, and at which point in the process the communication occurs.

Do not use a collaboration diagram if all activities still fall under the same single process control context and only internal separation of responsibilities is needed. In that case, a single pool with multiple lanes is usually sufficient.

## Pool vs. Lane

### Pool

**Use pools when**
- You want to model independent participants or different organizations.
- You want to show that the processes between parties do not share the same sequence flow.
- You want to create collaboration diagrams with clear boundaries of responsibility.

**Do not use pools when**
- The difference is only an internal role within a single organization or process system.

**Key principles**
- Each pool has its own process control.
- Sequence flows must not connect two pools.
- Communication between pools is modeled using message flows.

### Lane

**Use lanes when**
- You want to divide responsibilities within a single participant.
- You want to show handoffs between roles, teams, or applications within a single process context.

**Do not use lanes when**
- What is being modeled is actually an independent participant with their own process and autonomy.

**Key principles**
- Lanes are always nested within a pool.
- Lanes explain activity ownership, not communication relationships between independent participants.

## Message Flow vs. Sequence Flow

### Sequence Flow

Sequence flow is used for workflows within a single process scope. It shows the order of activities, events, or gateways within the same participant.

### Message Flow

Message flow is used for communication between pools. Camunda emphasizes that when a process moves from one participant to another, it must be modeled explicitly as a message flow, not a sequence flow.

### Quick Rules

- Use **sequence flow** only within a single pool.
- Use **message flow** only between pools.
- Do not draw sequence flows crossing pool boundaries.
- If the communication is directed between participants, the message flow is usually paired with message events, send tasks, or receive tasks.

## Key Collaboration Patterns

### 1. Single Pool Orchestration

**Best suited when**  
All activities fall under a single process control and only need to be divided by roles or units.

**Common structure**
- A single pool represents the main organization or system.
- Lanes are used to divide internal responsibilities.
- Handoffs between lanes still use sequence flows since it is still within a single orchestration.

**Advantages**
- Simpler and easier to read.
- Suitable for internal documentation and engine orchestration blueprints.

**Limitations**
- Does not highlight the independence of external participants.
- Can be misleading if used for relationships between organizations that in reality can only exchange messages with each other.

### 2. Multi-pool Collaboration

**Best suited when**  
There are two or more interacting participants, but each has their own process control.

**Common structure**
- Each participant is placed in a separate pool.
- Their respective internal processes can be modeled in full detail or summarized.
- Interactions between participants are connected with message flows.

**Advantages**
- More accurate for customer-supplier, partner integration, and external service interaction scenarios.
- Clearly shows responsibilities and communication contracts.

**Limitations**
- The diagram can be more complex than single-pool orchestration.

### 3. Collapsed Pool

**Best suited when**  
You know the communication interface with another participant, but do not know or do not need to show their detailed internal process.

**Common structure**
- The external participant pool is collapsed.
- Message flows are still shown to display the interaction interface.
- Your own internal process can remain expanded and detailed.

**Advantages**
- Keeps the focus on the interaction contract.
- Reduces diagram clutter when partner details are irrelevant.

**Limitations**
- Does not show internal dependencies or conditions of the collapsed party.
- Readers cannot see the internal logic of when a message is sent or received beyond the external interface.

### 4. Both Pools Collapsed

**Best suited when**  
Only the message exchange at the highest interface level needs to be shown.

**Advantages**
- Very concise.
- Useful for early integration contexts or communication contract overviews.

**Limitations**
- Camunda emphasizes that internal interdependencies are no longer visible; readers cannot know whether a message is always sent or only under certain conditions.

## How to Choose a Collaboration Structure

Use the following heuristics:

1. If all activities are still under a single process control, start with a **single pool**.
2. If the difference is only the internal owner, add **lanes**.
3. If there are independent participants that can only be reached via cross-party communication, split them into **multiple pools**.
4. If the other party's process is unknown or irrelevant, use a **collapsed pool**.
5. If the focus is only on high-level communication interfaces, consider having **both pools collapsed**.

## Common Events and Tasks in Collaboration

BPMN collaboration is usually easier to understand if message flows are associated with the right symbols on the sender and receiver sides. Camunda explains that message events are used for communication with a specific addressee, and event-based gateways are often used when the next path is determined by whichever event arrives first.

### Frequently Used Symbols

- **Message start event** for a process that is started by an incoming message.
- **Intermediate message catch event** to wait for a message in the middle of a process.
- **Intermediate message throw event** or **message end event** to send a message out.
- **Send task** for an activity explicitly intended to send a message.
- **Receive task** for an activity explicitly waiting for an incoming message.
- **Event-based gateway** for scenarios such as 'response arrives first or timer expires first.'
- **Timer event** for SLAs, timeouts, or response limits between parties.

## Common Communication Patterns

### Request-Response

**Pattern**
- Pool A sends a request to Pool B via a message flow.
- Pool B starts or resumes its internal process after receiving the message.
- Pool B sends a response back to Pool A via a separate message flow.

**Examples**
- Customer sends an order, supplier sends a confirmation.
- Internal system sends a request to an external service, then waits for a callback or response.

### Request-Timeout-Escalation

**Pattern**
- Pool A sends a request to Pool B.
- Pool A waits for a response using a message catch event, receive task, or event-based gateway.
- A timer handles cases where the response does not arrive on time.
- The timeout path can trigger an inquiry, reminder, escalation, or cancellation.

**Examples**
- Waiting for vendor confirmation for a maximum of 24 hours.
- Waiting for customer payment until a specific deadline.

### Fire-and-Forget Notification

**Pattern**
- Pool A sends a notification to Pool B without waiting for a direct reply.
- The process in Pool A continues immediately after sending.

**Examples**
- Billing system sends an invoice notice.
- Internal system sends a business event to a partner.

## Best Practices

- Use **pools** only if the participants are truly independent.
- Use **lanes** to divide internal responsibility, not to simulate independent participants.
- Ensure each **message flow** has a clear business meaning, such as an order, confirmation, invoice, inquiry, or cancellation.
- When the diagram is too crowded, collapse external pools whose details are not needed.
- For collaborations waiting for a response, consider combining a **message event**, **receive task**, **event-based gateway**, and **timer event**.
- Do not accidentally mix orchestration and collaboration; determine first whether you are modeling internal control or interactions between participants.

## Common Pitfalls

- Putting two independent organizations in a single pool when their relationship is purely exchanging messages.
- Connecting two pools with a sequence flow.
- Using lanes for external participants that actually have their own processes.
- Modeling communication interfaces without explaining the message type or its send/receive points.
- Displaying all processes of all parties in detail, causing the diagram to lose focus.

## Quick Checklist for AI

When creating a collaboration diagram, check the following:

- Have independent participants been separated into different pools?
- Does internal role separation use lanes, rather than unnecessary additional pools?
- Do message flows only occur between pools?
- Do sequence flows stay within pool boundaries?
- Has a collapsed pool been considered for external participants whose details are unknown?
- Is the main communication pattern clear: request-response, notification, or request-timeout?

## Quick Decision Table

| Situation | Recommended Representation |
|---|---|
| One organization, multiple internal roles | One pool + lanes |
| Customer interacting with supplier | Two pools + message flows |
| Partner process details unknown | Partner pool collapsed |
| Only wanting to show communication interfaces | Both pools collapsed |
| Waiting for response or timeout | Multi-pool + message event/receive task + timer or event-based gateway |

## Quick Heuristic for AI

Start with the question: "is this a single process with multiple roles, or multiple independent participants communicating with each other?" If it is a single process, use a single pool and lanes; if it is multiple independent participants, use a collaboration with multiple pools and message flows.
