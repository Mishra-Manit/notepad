# memory.md Template

Place this file at `~/work/memory.md`.

Claude reads this at the start of every session and updates it when it learns something durable. You can also edit it manually to add facts you want Claude to always know.

Keep it short. High-signal facts only. Claude will maintain it over time.

---

```markdown
# Workspace Memory

Read this file at the start of every session.
Update it when you learn a durable fact about the codebase, a workflow preference,
or a recurring pattern. Remove entries that are no longer accurate.

---

## Services

Facts about specific services that are not in their individual CLAUDE.md files,
or that are important enough to surface at the workspace level.

- `service-a`: [e.g. Requires local Redis on port 6379 — tests will hang without it]
- `service-b`: [e.g. DB migrations must be run manually after any schema change: `npm run migrate`]
- `service-c`: [e.g. Uses a feature flag service — always check flags before adding env-var-based toggles]

---

## Workflow Preferences

How this user prefers to work.

- [e.g. Always show test output in the implementation summary, even when passing]
- [e.g. Prefer multiple small PRs over one large PR when a ticket spans many services]
- [e.g. Always add a manual test step to the PR checklist — do not leave it empty]

---

## Active Work

Tickets currently in progress. Remove entries when PRs are merged.

| Ticket | Service(s) | Branch | Status |
|--------|-----------|--------|--------|
| — | — | — | — |

---

## Codebase Patterns

Recurring patterns discovered across multiple tickets.

[Add entries as you notice them. Example:]
- [e.g. Auth errors in service-a are almost always a missing `Authorization: Bearer` prefix — check headers first]
- [e.g. service-b's queue workers need a restart after config changes — not automatic]
