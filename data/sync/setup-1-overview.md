# Jira Workspace Setup

A Claude Code workspace that sits above all your microservice repos. You open it once, give Claude a Jira ticket ID, and it handles everything from reading the ticket to opening a PR for your review.

---

## Directory Structure

Create this layout on your machine. The name of the root folder is up to you.

```
~/work/
├── .claude/
│   ├── CLAUDE.md                  # Main brain — workflow rules + service map
│   ├── agents/
│   │   ├── service-worker.md      # Sub-agent that implements changes in a service
│   │   └── code-reviewer.md       # Sub-agent that reviews code before PR opens
│   └── skills/
│       └── brainstorming/
│           └── SKILL.md           # Skill that runs before any implementation
├── memory.md                      # Auto-updated by Claude across sessions
├── service-a/                     # Your existing microservice repo (git cloned here)
│   └── CLAUDE.md                  # Service-specific context (stack, tests, key files)
├── service-b/
│   └── CLAUDE.md
└── service-c/
    └── CLAUDE.md
```

---

## Setup Steps

**1. Create the workspace directory**

```bash
mkdir -p ~/work/.claude/agents
mkdir -p ~/work/.claude/skills/brainstorming
```

**2. Copy the files from this sidebar**

| File to create | Source page in this sidebar |
|----------------|----------------------------|
| `~/work/.claude/CLAUDE.md` | Root CLAUDE.md |
| `~/work/.claude/agents/service-worker.md` | Service Worker Agent |
| `~/work/.claude/agents/code-reviewer.md` | Code Reviewer Agent |
| `~/work/.claude/skills/brainstorming/SKILL.md` | Brainstorming Skill |
| `~/work/memory.md` | memory.md Template |

**3. Clone your microservice repos into the workspace**

```bash
cd ~/work
git clone git@github.com:your-org/service-a.git
git clone git@github.com:your-org/service-b.git
git clone git@github.com:your-org/service-c.git
```

**4. Add a CLAUDE.md to each service**

Copy the Per-Service Template page from this sidebar into each service directory. Fill in the `[bracketed]` fields with real values for that service.

```bash
# Example: add context for service-a
nano ~/work/service-a/CLAUDE.md
```

**5. Edit the Service Map in the root CLAUDE.md**

Open `~/work/.claude/CLAUDE.md` and update the Service Map table with your actual services, their paths, tech stacks, and what they do.

**6. Open Claude Code in the workspace**

```bash
cd ~/work
claude
```

---

## Daily Workflow

Once everything is set up, using it is simple:

```
You:    "Work on PROJ-123"

Claude: Runs /brainstorming — asks clarifying questions,
        proposes an approach, waits for your approval

You:    "go" (or adjust the approach)

Claude: Fetches the Jira ticket
        Identifies which service is affected
        Shows you a step-by-step plan — waits for approval

You:    "go"

Claude: Spawns the service-worker agent
        Works in an isolated git branch
        Implements changes, runs tests, commits

        Spawns the code-reviewer agent automatically
        Reviews the diff for security issues and correctness

        Shows you the implementation + review summary

You:    "open pr"

Claude: Opens a PR linked to the Jira ticket
```

---

## How the Pieces Fit Together

```
You (Claude Code in ~/work/)
  │
  ├── reads ~/work/.claude/CLAUDE.md       ← orchestration rules + service map
  ├── reads ~/work/memory.md               ← durable context from past sessions
  ├── runs /brainstorming skill            ← clarifies intent before any code
  │
  ├── calls Jira MCP                       ← fetches ticket details
  │
  ├── spawns service-worker agent
  │     ├── reads service-a/CLAUDE.md      ← stack details, test commands
  │     ├── creates git worktree           ← isolated branch, never touches main
  │     ├── implements + commits
  │     └── runs tests
  │
  └── spawns code-reviewer agent
        ├── runs git diff on the branch
        ├── checks security + correctness
        └── returns APPROVED / WARN / BLOCKED
```

---

## What Claude Will Not Do Without Your Approval

- Write any code (waits for "go" after showing the plan)
- Open a PR (waits for "open pr" after showing the summary)
- Commit to main — all work happens on feature branches in isolated worktrees

---

## Troubleshooting

**Sub-agent cannot find the service**
Make sure the path in the Service Map matches the actual directory name inside `~/work/`.

**Tests fail after implementation**
The service-worker agent will stop and report the failure. Do not open a PR. Fix manually or ask Claude to diagnose.

**Code review returns BLOCKED**
Claude will not open a PR. It will show you the specific issues. You can ask Claude to fix them and re-run the review, or fix them yourself.

**Claude forgets context between sessions**
That is what `memory.md` is for. If Claude is missing context, check that file and add the missing fact in plain bullet form.
