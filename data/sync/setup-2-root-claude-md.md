# Root CLAUDE.md

Place this file at `~/work/.claude/CLAUDE.md`.

Before using, **update the Service Map table** with your actual services. Everything else can stay as-is.

---

# Work Workspace

## Session Start

At the start of every session, in this order:
1. Read `memory.md`
2. Invoke the `/brainstorming` skill before doing any work on a ticket

Do not skip either step. Do not fetch a ticket or write any code until brainstorming
has run and the user has approved an approach.

---

## Persistent Memory

Read `memory.md` at the start of every session. Update it when you learn something
durable about a service, a workflow preference, or a recurring pattern.

---

## Service Map

Update this table before first use. Add one row per microservice.

| Service    | Path          | Tech Stack             | What it does                        |
|------------|---------------|------------------------|-------------------------------------|
| service-a  | ./service-a   | Node.js / Express      | User authentication and accounts    |
| service-b  | ./service-b   | Python / FastAPI       | Order processing and fulfillment    |
| service-c  | ./service-c   | Go / Gin               | Notification delivery               |

Each service has its own `CLAUDE.md` with stack details, test commands, and key file
locations. Always read it before touching that service.

---

## Workflow

When given a Jira ticket ID, follow these steps exactly. Do not skip or reorder them.

### Step 1 — Fetch the ticket

Use the Jira MCP to retrieve the ticket. Extract:
- Title and full description
- Acceptance criteria (look for a checklist or "AC:" section)
- Labels, components, or epic (these often indicate which service is affected)
- Any linked tickets

### Step 2 — Plan

Identify which service from the Service Map is affected.

Present a plan in this exact format, then stop and wait:

---
**Ticket:** PROJ-123 — [title]

**Service:** `service-a`

**Plan:**
1. [specific change, e.g. "add rate-limit middleware at src/middleware/rateLimiter.ts"]
2. [next step]
3. [next step]

Reply `go` to start, or tell me what to change.

---

Do not write any code until the user says "go".

If the ticket is unclear or acceptance criteria are missing, ask one clarifying question
before presenting the plan.

### Step 3 — Implement

Spawn the `service-worker` sub-agent. Pass it:
- The ticket ID and title
- The service path (from the Service Map above)
- The specific changes needed

The sub-agent:
1. Creates an isolated git worktree for the branch
2. Reads the service's own CLAUDE.md
3. Implements the changes and commits them
4. Runs the service's tests
5. Returns a summary

When it finishes, immediately spawn the `code-reviewer` agent on the same worktree.
Pass it the ticket ID and the branch name. Do not show the implementation summary
yet — wait for the review to complete first.

If the code-reviewer returns **BLOCKED**: stop, show the user the issues, and ask how
to proceed. Do not open a PR.

If the code-reviewer returns **APPROVED** or **WARN**: present the combined summary:

---
**Implementation complete — PROJ-123**

**service-a** (`feat/PROJ-123-add-rate-limiting`)
- Changed: `src/middleware/rateLimiter.ts`, `src/routes/checkout.ts`
- Commits: 2
- Tests: passed

**Code review:** APPROVED — no issues found.

Reply `open pr` when ready.

---

### Step 4 — Open PR

When the user says "open pr":

Push the branch and create a PR using this format:

**Title:** `[PROJ-123] Short description under 60 chars`

**Body:**
```
## Summary
- [one bullet per logical change]

## Jira
[full URL to the Jira ticket]

## Test plan
- [ ] [specific thing to manually verify]
- [ ] [another specific check]
```

Print the PR URL when done.

---

## Conventions

- **Branch naming:** `feat/PROJ-123-short-description` (lowercase, hyphens, no special chars)
- **Commit format:** `feat: PROJ-123 short description` (conventional commits, under 72 chars)
- **Prefixes:** `feat:` new capability / `fix:` bug fix / `refactor:` no behavior change / `chore:` config or deps
- **Never commit to main** — all work happens on feature branches in isolated worktrees
- **Never open a PR without explicit user approval**
- **Always link the Jira ticket in the PR body** — include the full ticket URL under `## Jira`
