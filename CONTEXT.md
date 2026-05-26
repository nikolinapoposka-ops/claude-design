# Store Audits — Domain Context

## Core Concept

A **Store Audit** is always about one store. The store is the subject; the executor varies.

## Terms

### Audit
A structured set of questions, organised into sections, used to evaluate a single store against a compliance standard. An audit always belongs to one store, regardless of who fills it in.

### Audit Template
A reusable definition of sections and questions. Users initiate audits from templates; they do not create audits from scratch (except store managers with specific permission).

### Self-Audit
An audit where the store fills in their own responses. The store receives the audit, sees it in their list, and sees the result when complete.

### Auditor-Visit
An audit where a named auditor visits the store and fills in responses on the store's behalf. The store does **not** receive the audit, does not see it in their list, and does not see the result. Only the auditor and HQ have visibility.

### Distribution Flow
The combination of who initiates an audit, who executes it, and who receives it. Four flows are supported (see below).

## Permissions

Three independent permissions control access:

| Permission | What it unlocks |
|---|---|
| **Create Store Audit Templates** | Build and edit audit templates |
| **Initiate Audit from Template** | Launch an audit from an existing template |
| **Store Audits Access** | Module is visible at all |

A Store Manager without *Initiate Audit from Template* can only **complete** audits sent to them — they cannot create or launch one. "Creating an audit from scratch" means initiating from an HQ-authored template, not bypassing templates entirely. Templates are always required.

## Distribution Flows

| # | Initiator | Executor | Store receives audit? | Store sees results? | Approvers |
|---|-----------|----------|-----------------------|---------------------|-----------|
| 1 | HQ | — | No (template save only) | — | — |
| 2 | HQ / Manager | Named auditor | No | No | None |
| 3 | HQ / Manager | Store | Yes | Yes | Optional |
| 4 | District / Area / Store Manager | Store or auditor | Depends on sub-flow | Depends | Optional (store sub-flow only) |

## Follow-up Tasks

Auto-generated follow-up tasks always go to the **store**, regardless of who conducted the audit. In an auditor-visit, this is the store's only touch-point with the audit outcome — the audit itself stays hidden, but the task appears in their Employee Hub. The task links back to the originating audit.

Follow-up tasks display a reference to the originating audit. The reference is a **clickable link if the user has access to the audit**, or **plain text if they do not** (e.g. a store user in an auditor-visit). Either way the store knows why the task exists. Navigable from inside the audit for all users with audit access.

## Chat

Each audit has a contextual chat scoped per store per audit instance.

- **Self-audit flow**: chat is between the store and whoever sent the audit (HQ / manager).
- **Auditor-visit flow**: chat is between the auditor and HQ only. The store has no presence in the chat and cannot see it.

## Visibility Rules

- In an **Auditor-Visit**, the audit does not appear in the store's list and the score is not shared with the store.
- In a **Self-Audit**, the store sees the audit in their list, can start/continue it, and sees the score when complete.
