# AGENTS.md — Multi-Agent Coordination Guide

This document defines how multiple AI agents (or sequential agent sessions) should coordinate when building the Notepad application. It prevents conflicts, duplication, and architectural drift.

---

## Prerequisite Reading

Before writing any code, every agent **must** read:

1. **`SPEC.md`** — What to build (features, layout, data model, acceptance criteria)
2. **`CLAUDE.md`** — How to build it (tech constraints, code style, pitfalls)
3. **This file** — How to coordinate with other agents

---

## Work Phases

The project should be built in this order. Each phase should be fully complete (no broken state) before moving to the next. An agent may complete multiple phases in one session if scope allows.

### Phase 1: Foundation

**Owner**: First agent session

- [ ] Set up `src/types/index.ts` with `NotepadData` interface
- [ ] Create `src/lib/constants.ts` (localStorage key, size limits)
- [ ] Create `src/lib/utils.ts` (date formatting helpers)
- [ ] Create `src/lib/storage.ts` (localStorage read/write/size helpers)
- [ ] Create `src/hooks/useLocalStorage.ts` (debounced persistence hook)
- [ ] Update `src/app/globals.css` with the dark theme palette and Tailwind v4 tokens
- [ ] Install required dependencies (`lucide-react`, Tiptap packages)

**Exit criteria**: Types compile, hooks are unit-testable, `globals.css` has correct theme tokens.

### Phase 2: Layout + Editor Shell

**Owner**: Any agent (Phase 1 must be complete)

- [ ] Create `src/components/NotepadApp.tsx` — top-level client component, centered card layout, state wiring
- [ ] Create `src/components/Editor.tsx` — Tiptap editor with markdown input rules
- [ ] Create `src/components/Toolbar.tsx` — formatting toolbar (bold, italic, code, heading, link, checklist)
- [ ] Wire editor into `NotepadApp` — content changes trigger debounced save
- [ ] Update `src/app/page.tsx` to render `<NotepadApp />`
- [ ] Update `src/app/layout.tsx` with Inter font and correct metadata (title: "Notepad")

**Exit criteria**: App renders as a centered dark card with a working Tiptap editor. Markdown input rules work. Content persists across reloads.

### Phase 3: Images + Storage

**Owner**: Any agent (Phase 2 must be complete)

- [ ] Implement image paste handling (base64 embed via Tiptap image extension)
- [ ] Implement image drag-and-drop
- [ ] Create `src/components/StorageWarning.tsx` — shown when localStorage > 4MB
- [ ] Add footer with storage usage indicator and "Saved" status

**Exit criteria**: Images can be pasted/dropped and render inline. Storage usage is visible. Content persists.

### Phase 4: Polish

**Owner**: Any agent (Phase 3 must be complete)

- [ ] Create `src/hooks/useKeyboardShortcuts.ts` — global shortcuts (Cmd+Shift+Backspace for clear all)
- [ ] Add "clear all" functionality with confirmation dialog
- [ ] Fine-tune all spacing, colors, hover states, transitions to match Linear aesthetic
- [ ] Ensure responsive behavior (editor card stays readable on mobile)
- [ ] Test all acceptance criteria from SPEC.md
- [ ] Clean up any console.logs, unused imports, TODO comments

**Exit criteria**: All acceptance criteria in SPEC.md pass. App looks polished.

---

## File Ownership Rules

To prevent merge conflicts when multiple agents work in parallel (rare but possible):

| Directory / File               | Modify Only During | Notes                                    |
| ------------------------------ | ------------------ | ---------------------------------------- |
| `src/types/index.ts`           | Phase 1            | Append-only after Phase 1                |
| `src/lib/*`                    | Phase 1            | Stable API after Phase 1                 |
| `src/hooks/useLocalStorage.ts` | Phase 1            | Stable after Phase 1                     |
| `src/hooks/useKeyboardShortcuts.ts` | Phase 4       | Created in Phase 4 only                  |
| `src/components/NotepadApp.tsx`| Phase 2, 3, 4      | Main wiring — extended in later phases   |
| `src/components/Editor.tsx`    | Phase 2            | Only editor agent touches this           |
| `src/components/Toolbar.tsx`   | Phase 2            | Only editor agent touches this           |
| `src/components/StorageWarning.tsx` | Phase 3       | Created in Phase 3                       |
| `src/app/globals.css`          | Phase 1, 4         | Phase 4 only for minor polish            |
| `src/app/page.tsx`             | Phase 2            | One-time change, then stable             |
| `src/app/layout.tsx`           | Phase 2            | One-time change, then stable             |
| `package.json`                 | Phase 1            | Only to add dependencies                 |

---

## Conventions for Agent Handoff

### Before starting work

1. Read `SPEC.md`, `CLAUDE.md`, and `AGENTS.md`
2. Run `bun run build` to verify the project compiles
3. Check which phases are already complete by examining existing files in `src/`
4. Identify the next incomplete phase and work on that

### While working

- **Never delete or rename existing files** without explicit user instruction
- **Never remove existing functionality** to add new functionality
- **Always keep the app in a buildable state** — if you `bun run build` at any point, it should succeed
- **Add imports at the top of files**, never mid-file
- If you need to modify a type in `src/types/index.ts`, **extend** it — don't change existing field names or types that other components depend on

### After completing work

- Run `bun run build` to confirm no errors
- Run `bun run lint` to confirm no lint issues
- Update the checkboxes in the relevant phase above (change `[ ]` to `[x]`)
- If you created files not listed in SPEC.md, add a brief note at the bottom of this file explaining why

---

## Dependency Installation

Only these packages should be added beyond what's already in `package.json`:

```bash
# Phase 1 — All dependencies at once
bun add lucide-react @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-code-block-lowlight lowlight
```

Do NOT add any other packages without explicit user approval. Keep the dependency tree minimal.

---

## Architecture Invariants

These rules must never be violated:

1. **No backend.** Zero API routes, zero server actions, zero fetch calls. Everything is client-side + localStorage.
2. **No external state libraries.** React hooks only (useState, useMemo, useCallback, useEffect).
3. **No CSS-in-JS.** Tailwind CSS v4 utility classes only.
4. **Single localStorage key** (`notepad_data`). Do not fragment data across multiple keys.
5. **Dark theme only** for v1. No light mode toggle.
6. **All components are TypeScript.** No `.js` or `.jsx` files.
7. **`"use client"`** on every component that touches browser APIs. Server components only for `layout.tsx` and `page.tsx`.
8. **Single writing surface.** No sidebar, no multi-note UI, no note list, no navigation.

---

## Conflict Resolution

If an agent encounters code that contradicts `SPEC.md`:

- **SPEC.md wins.** It is the source of truth for requirements.
- **CLAUDE.md wins** for code style and technical decisions.
- If SPEC.md is ambiguous, make the simplest choice that satisfies the acceptance criteria and document the decision as a comment in the code.

---

## Additional Files Log

Track any files created that aren't in the original SPEC.md component architecture:

| File | Phase | Reason |
| ---- | ----- | ------ |
| *(none yet)* | | |
