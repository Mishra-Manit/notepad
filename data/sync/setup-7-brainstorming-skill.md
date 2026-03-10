# Brainstorming Skill

Place this file at `~/work/.claude/skills/brainstorming/SKILL.md`.

This skill runs before any implementation work. It slows Claude down just enough to make sure it understood the ticket correctly and is taking the right approach — before any code is written.

---

```yaml
name: brainstorming
description: >
  Use before any implementation. Explores the ticket intent, identifies
  the right approach, and gets explicit approval before touching code.
  Invoke with /brainstorming.
```

# Brainstorming — Understand Before Building

## Purpose

Stop and think before implementing. The goal is to make sure the approach
is correct before the service-worker agent writes a single line of code.

## Process

### 1. Understand the ticket

Read the ticket details already fetched. Ask yourself:
- What is the actual goal, not just the stated task?
- Are there unstated constraints (performance, backward compatibility, security)?
- Does this touch any sensitive areas (auth, payments, data deletion)?
- Is anything ambiguous?

### 2. Ask one clarifying question if needed

If anything is genuinely unclear, ask **one question** — the most important one.
Do not ask multiple questions at once. Wait for the answer before continuing.

If the ticket is clear enough to proceed, skip this step.

### 3. Propose an approach

Present 2-3 ways to implement this, with a clear recommendation:

---
**Approach A (recommended):** [brief description]
- Pro: [why this is better]
- Con: [trade-off]

**Approach B:** [brief description]
- Pro: [when this would be preferred]
- Con: [why not recommending it here]

**My recommendation:** Approach A because [specific reason relevant to this ticket].

Reply `go` to proceed with Approach A, or tell me which approach you prefer.

---

### 4. Get explicit approval

Do not move to implementation until the user responds. If they say `go`,
proceed. If they push back, adjust the approach and present again.

## Key principles

- One question at a time — never stack multiple questions
- Always lead with a recommendation — don't just list trade-offs and shrug
- YAGNI — do not propose approaches that build for hypothetical future requirements
- If the ticket is small and unambiguous, say so and keep this short

---

## Setup note

Skills in Claude Code live in `.claude/skills/<name>/SKILL.md`. Create the directory first:

```bash
mkdir -p ~/work/.claude/skills/brainstorming
```

Then copy the file content above into `~/work/.claude/skills/brainstorming/SKILL.md`.

Invoke it during a session by typing `/brainstorming`.
