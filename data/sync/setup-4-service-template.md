# Per-Service CLAUDE.md Template

Drop this file into each service directory as `CLAUDE.md`. Fill in all `[bracketed]` fields.

One file per service. The more specific you are, the better Claude performs in that service.

---

# [Service Name]

## Overview

[One or two sentences: what does this service do, and what is its role in the
system? e.g. "Handles all payment processing and communicates with Stripe.
Downstream of the order service, upstream of the fulfillment service."]

---

## Tech Stack

- **Language:** [e.g. Node.js 20, Python 3.12, Go 1.22]
- **Framework:** [e.g. Express 4, FastAPI 0.110, Gin]
- **Database:** [e.g. PostgreSQL 15 via Prisma ORM, Redis for caching]
- **Key dependencies:** [e.g. Stripe SDK, AWS S3 client, Bull for queues]
- **Package manager:** [e.g. npm, pnpm, pip, go mod]

---

## Running Locally

```bash
# Install dependencies
[npm install | pip install -r requirements.txt | go mod download]

# Copy and fill environment variables
cp .env.example .env
# Edit .env — required vars are listed in .env.example

# Start dev server
[npm run dev | uvicorn main:app --reload | go run .]
```

**Required local dependencies:**
- [e.g. PostgreSQL running on port 5432]
- [e.g. Redis running on port 6379]
- [e.g. Nothing — uses SQLite locally]

---

## Running Tests

```bash
# All tests
[npm test | pytest | go test ./...]

# With coverage
[npm run test:coverage | pytest --cov=src | go test -cover ./...]

# Single file or test
[npx jest src/middleware/auth.test.ts | pytest tests/test_auth.py | go test ./pkg/auth/...]
```

**Expected output when passing:** [e.g. "42 passing", "100% coverage on critical paths"]

---

## Key Files

| Path | Purpose |
|------|---------|
| `src/routes/` | API endpoint definitions — one file per domain |
| `src/services/` | Business logic — all DB calls go here, never in routes |
| `src/models/` | Data models, types, and Zod/Pydantic schemas |
| `src/middleware/` | Auth, logging, rate limiting, error handling |
| `src/utils/` | Shared helpers and pure functions |
| `migrations/` | Database migrations — run with `[command]` |
| `tests/` | Test files — mirror the `src/` structure |

---

## Conventions

[List the non-obvious rules this codebase enforces. Be specific.]

- [e.g. All routes must pass through the `requireAuth` middleware before hitting business logic]
- [e.g. Use the repository pattern — all DB queries live in `src/repositories/`, never in routes or services]
- [e.g. All API responses must use the envelope in `src/utils/response.ts` — `{ success, data, error }`]
- [e.g. Environment variables must be accessed via `src/config.ts`, never via `process.env` directly]
- [e.g. Errors must be logged with the logger before being thrown — never silently swallowed]

---

## Non-Obvious Patterns

[Gotchas, quirks, and things that will cause bugs if Claude doesn't know them.]

- [e.g. The `User` model uses soft deletes — never hard delete a user record. Use `user.delete()` which sets `deletedAt`.]
- [e.g. All money values are stored as integers (cents), never floats. Use `toCents()` and `fromCents()` helpers.]
- [e.g. Feature flags are read from the `flags` service via gRPC, not from env vars or the database.]
- [e.g. This service is stateless — never store anything in module-level variables between requests.]

---

## PR Checklist

Before any PR is opened on this service, verify:

- [ ] All tests pass locally
- [ ] No `console.log`, `print()`, or `fmt.Println()` in production code paths
- [ ] Environment variable additions are documented in `.env.example`
- [ ] Database migrations are included if schema changed
- [ ] [Any service-specific check, e.g. "API contract changes are reflected in the shared types package"]

---
