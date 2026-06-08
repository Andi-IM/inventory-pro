# Event Patterns

This guide summarizes the most useful BPMN 2.0 event patterns when creating realistic process diagrams. It focuses on the behavioral semantics of events, the relationship between catching and throwing events, and selecting the right patterns for timeouts, exceptions, broadcasts, business rollbacks, and asynchronous coordination.

## Core Event Principles

BPMN distinguishes between start, intermediate, and end events, as well as catching and throwing events. Catching events react to triggers, whereas throwing events are triggered by the process itself to send or signal a result during execution or at process completion.

Catching events can start a process, resume a process path, cancel an active task or subprocess, or add an extra path while the main activity remains active. Throwing events are used when the process needs to "throw" a message, signal, error, escalation, compensation, or other final result to its surrounding context.

## Event Selection Patterns

Use the following questions when selecting events:

- Is the process **waiting for something to happen**? Use a catching event.
- Is the process **producing or announcing something**? Use a throwing event.
- Must the event **stop the currently running activity**? Use an interrupting boundary event or an interrupting event subprocess.
- Does the event only **open an additional path** without stopping the main activity? Use a non-interrupting boundary event or a non-interrupting event subprocess.
- Is the trigger in the form of **time**, **message**, **condition**, **broadcast**, **error**, **escalation**, or **compensation**? Choose the event type with the most appropriate semantics.

## Timeout Patterns

### 1. Boundary Timer for Task Deadlines

**Use when**  
A task or subprocess has a clear deadline, SLA, or expiration period.

**Pattern**
- Attach an interrupting timer boundary event to the task or subprocess.
- If the timer triggers before the activity finishes, the activity is canceled and the flow moves to the timeout path.
- If the activity finishes first, the timer is ignored.

**Best suited for**
- Expired approvals.
- Waiting for payment with a deadline.
- Waiting for vendor or customer response.

**Do not use when**
- The main activity must continue running even though the timeout needs to be handled in parallel; use a non-interrupting timer boundary event.

### 2. Non-interrupting Timer for Reminders or Escalation

**Use when**  
A periodic reminder or follow-up path is needed without canceling the main activity.

**Pattern**
- Attach a non-interrupting timer boundary event to the task or subprocess.
- When the timer triggers, the main activity continues running and BPMN opens an additional path for notifications, reminders, or escalation.

**Best suited for**
- Approval reminders every 24 hours.
- Follow-up notifications when a ticket has not been handled.
- Gradual escalation without stopping the main work.

### 3. Event-based Gateway for Reply-vs-timeout Race

**Use when**  
The process waits for one of several events, such as an incoming message or a timer expiring first.

**Pattern**
- Place an event-based gateway after the action that triggers the wait.
- Connect to an intermediate message catch event or a receive task for the response.
- Connect alternative paths to an intermediate timer catch event for the timeout.
- The event that happens first determines the process path.

**Best suited for**
- Waiting for payment or payment timeout.
- Waiting for user confirmation or auto-canceling after a certain duration.
- Asynchronous processes where the outcome is determined by the fastest event.

## Exception Patterns

### 4. Error Boundary Event for Failure Paths

**Use when**  
A serious failure on a task or subprocess needs to trigger a clear exception flow.

**Pattern**
- Place an error boundary event on the relevant subprocess or activity.
- Within the same scope, use an error throw event or an error end event to signal the failure.
- The parent flow handles recovery, notifications, cleanup, or termination as needed.

**Best suited for**
- Failure to process payment.
- Failure to obtain items from the procurement subprocess.
- Process failures that cannot be treated as just simple warnings.

**Do not use when**
- The condition is actually a non-fatal business issue that only needs to be reported to a higher level; use an escalation event.

### 5. Event Subprocess for Cross-scope Exceptions

**Use when**  
A specific event must be handled at the parent process or enclosing subprocess level, rather than just on a single task.

**Pattern**
- Use an event subprocess with a dotted border inside the relevant process scope.
- Choose an interrupting event subprocess if the main process must be stopped.
- Choose a non-interrupting event subprocess if handling runs in parallel with the main process.

**Best suited for**
- Cancellation requests while the order is in progress.
- Additional notifications that can occur at any time while the process is active.
- Process incident handling that applies to the entire scope, rather than just one activity.

## Messaging Patterns

### 6. Message Event for Directed Communication

**Use when**  
There is communication with a specific receiver, especially between pools in a collaboration diagram.

**Pattern**
- Use a message start event if the process is started by a message.
- Use an intermediate message catch event if the process waits for an incoming message in the middle of the flow.
- Use a message throw or end event if the process sends a message out.
- Use message flows between participants, not sequence flows between pools.

**Best suited for**
- Order received from customer.
- Confirmation sent to vendor or customer.
- Reply from another system with a clear addressee.

**Do not use when**
- Information is broadcast to multiple listeners; use a signal.

### 7. Signal Event for Broadcasts

**Use when**  
Information needs to be broadcast and is not directed to a specific receiver.

**Pattern**
- Use a signal throw event to announce the event.
- Use a signal catch event on other processes that need to react to the broadcast.

**Best suited for**
- Global announcement that stock has changed.
- Cross-process triggers that do not depend on a single receiver.

**Do not use when**
- The communication is actually point-to-point; use a message event.

## State-based Patterns

### 8. Conditional Event for State Changes

**Use when**  
The process must wait until a condition becomes true, rather than until a message arrives or a time is reached.

**Pattern**
- Use an intermediate conditional catch event or a conditional boundary event.
- Clearly define the business condition being waited for.

**Best suited for**
- Waiting for verification status to change.
- Waiting for minimum stock threshold to be reached.
- Waiting for specific prerequisites to become active.

**Do not use when**
- The trigger is more appropriately represented by a timer or message event.

## Escalation Patterns

### 9. Escalation for Non-fatal Issues

**Use when**  
A subprocess needs to report an important issue to the parent process without treating it as a fatal error.

**Pattern**
- Use an escalation throw event or an escalation end event in the subprocess.
- Catch with an escalation boundary event on the parent scope.
- Use a non-interrupting version if the parent wants to follow up without canceling the subprocess.

**Best suited for**
- Case requires additional manager approval.
- Business anomaly exists that needs attention but the main process can still continue.
- Subprocess needs to "raise its hand" to a higher level.

**Do not use when**
- The event is a true failure that must stop or break the main flow; use an error.

## Compensation Patterns

### 10. Compensation for Business Rollback

**Use when**  
The process needs to undo the business consequences of an activity that was previously successfully completed.

**Pattern**
- Mark a compensation task or compensation subprocess as a compensation handler.
- Connect with an association, not a sequence flow.
- Use a compensation throw event or a compensation end event to trigger the rollback.

**Best suited for**
- Canceling room reservation.
- Canceling shipment booking.
- Restoring status or resources after a failure in a subsequent step.

**Do not use when**
- Only wanting to flag a technical error or stop the process.
- The activity to be canceled has never successfully completed from a business perspective.

## Termination Patterns

### 11. Terminate End Event for Hard Stop

**Use when**  
A single outcome is sufficient to close the entire process scope, including all active parallel branches.

**Pattern**
- Place a terminate end event on the path that must immediately end the process.
- When reached, all other activities within that scope are stopped.

**Best suited for**
- Fraud detected and the entire process must be stopped.
- A specific final outcome makes other branches irrelevant.

**Do not use when**
- You still need to wait for other parallel branches to complete normally.

## Readability Patterns

### 12. Link Event for Large Diagrams

**Use when**  
The diagram is too crowded or sequence flows are too long, decreasing readability.

**Pattern**
- Use link throw and link catch events to connect diagram parts logically.
- Ensure link names or pairs are clear so the reader does not get lost.

**Best suited for**
- Single-page diagrams with many branches.
- Diagrams that need to be split into different visual areas without changing process semantics.

**Do not use when**
- The diagram is still small enough and normal sequence flows are clearer.

## Transaction-Specific Pattern

### 13. Cancel Event for Transaction Subprocess

**Use when**  
The model uses a transaction subprocess and requires transaction cancellation according to BPMN semantics.

**Pattern**
- Use a cancel end event inside the transaction subprocess.
- Catch with a cancel boundary event on the transaction scope.

**Do not use when**
- The process is not modeled as a transaction subprocess.

## Pattern Comparison

| Pattern | Main Event | Interrupt Main Activity | Use Case |
|---|---|---:|---|
| Deadline task | Interrupting timer boundary | Yes | Approval timeout |
| Reminder | Non-interrupting timer boundary | No | SLA Reminder |
| Reply vs timeout | Event-based gateway + message/timer | Path-dependent | Waiting for response |
| Serious failure | Error event | Usually yes | Payment failure |
| Non-fatal issue | Escalation event | Optional | Manager review |
| Business rollback | Compensation event | Not always | Cancel reservation |
| Broadcast | Signal event | No | Global notification |
| Direct communication | Message event | Not always | Request/response between pools |
| Whole-scope handler | Event subprocess | Interrupting or not | Cancel request while process active |
| Stop everything | Terminate end event | Yes, entire scope | Hard stop process |

## Quick Heuristics for AI

- If the process is **waiting for a reply** from another party, consider a message catch event or a receive task; if there is a deadline, combine it with a timer.
- If the process needs a **timeout path**, choose between a boundary timer or an event-based gateway depending on whether the process is waiting on a specific activity or in a race between events.
- If the event is a **fatal failure**, use error; if it only needs to report to a higher level, use escalation.
- If a **business rollback** is needed, use compensation, not a regular error.
- If the event can occur at any time while the scope is active and affects the entire scope, consider an event subprocess.
- If the notification must be a **broadcast**, use a signal; if it is directed to a specific participant, use a message.
