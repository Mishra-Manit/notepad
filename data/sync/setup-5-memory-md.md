# memory.md Template

Place this file at `~/work/memory.md`.

Claude reads this at the start of every session and updates it when it learns something durable. You can also edit it manually to add facts you want Claude to always know.

This file is **workspace-level context** — not a per-service changelog. Only write things here that are true across multiple services, affect how you prompt agents, or would meaningfully change how Claude approaches any ticket. If something only applies to one service, put it in that service's `CLAUDE.md` instead.

Keep it short. High-signal facts only.

---

```markdown
# Workspace Memory

Read this file at the start of every session.
Update it when you learn something durable that affects how you work across
this entire repository. Remove entries that are no longer accurate.

Do not add per-service trivia or per-ticket notes here.

---

## Architecture

Cross-cutting facts about how this system is built.

- [e.g. All services share a single Postgres instance — schema changes can affect multiple services]
- [e.g. Auth is handled exclusively by service-a — other services trust the JWT it issues, never re-validate]
- [e.g. Inter-service calls go through an internal message queue, not direct HTTP — no synchronous RPC]

---

## Prompting Preferences

How this user gives instructions and expects agents to behave.

- Always ask clarifying questions about implementation approach before writing any code — never assume and run with an idea
- [e.g. When a ticket is ambiguous, always ask one clarifying question before presenting a plan — never guess]
- [e.g. Show implementation summary and code review verdict together, not separately]
- [e.g. Prefer smaller focused PRs — if a ticket touches 3+ files across different concerns, ask before combining]

---

## Cross-Service Conventions

Patterns and standards that apply to every service in this repository.

- [e.g. All API responses use the standard envelope: `{ success, data, error, meta }`]
- [e.g. Environment variables are never read inline — always loaded through a central config module]
- [e.g. Every new endpoint requires a corresponding entry in the shared Postman collection]

---

## What Not To Do

Hard lessons that apply everywhere — things Claude got wrong before or patterns that consistently cause problems.

- [e.g. Never run migrations automatically as part of implementation — always surface them separately for the user to run]
- [e.g. Do not add `console.log` or `print()` debug statements — they have caused production incidents before]
```
