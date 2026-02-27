# CLAUDE.md — Agent Coding Guidelines

This file provides instructions for AI coding agents (Claude, Windsurf Cascade, Cursor, etc.) working on the Notepad project. Read this before writing any code.

---

## Project Summary

A single-screen, distraction-free notepad — one centered writing surface on a dark background. No sidebar, no multi-note management, no backend. All persistence via localStorage. See `SPEC.md` for full requirements.

---

## Tech Stack & Versions

- **Framework**: Next.js 16 (App Router) — do NOT use Pages Router
- **React**: 19.2.3
- **TypeScript**: 5.x, strict mode enabled
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` — do NOT use Tailwind v3 syntax or `tailwind.config.js`
- **Font**: Inter (via `next/font/google`)
- **Package manager**: Bun (`bun add`, not `npm install`)
- **Linting**: ESLint with `eslint-config-next`

---

## Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun run build    # Production build
bun run lint     # Run ESLint
```

---

## Code Conventions

### General

- All components use **TypeScript** (`.tsx` / `.ts`). Never use `.js` or `.jsx`.
- Use **named exports** for components. Default exports only for Next.js pages/layouts (required by framework).
- Prefer **functional components** with hooks. No class components.
- Use `"use client"` directive on any component that uses browser APIs (useState, useEffect, event handlers, localStorage, etc.). The root `layout.tsx` and `page.tsx` server components should delegate to a client component (`NotepadApp.tsx`).
- **No `any` types.** Define proper interfaces in `src/types/index.ts`.

### File Structure

Follow the structure defined in `SPEC.md`:

```
src/
├── app/           # Next.js App Router files only (layout, page, globals.css)
├── components/    # React components (NotepadApp, Editor, Toolbar, StorageWarning)
├── hooks/         # Custom React hooks (useLocalStorage, useKeyboardShortcuts)
├── lib/           # Utility functions, constants, storage helpers
└── types/         # TypeScript type definitions
```

- One component per file. File name matches component name (`Editor.tsx` → `export function Editor`).
- Hooks go in `src/hooks/`, named `use*.ts`.
- Pure utility functions go in `src/lib/`.
- **No sidebar components, no note-list components.** This is a single-pane app.

### Styling

- **Tailwind CSS v4 only.** No inline `style={{}}` unless absolutely necessary (e.g., dynamic values).
- Tailwind v4 uses `@import "tailwindcss"` in CSS — there is no `tailwind.config.js`. Custom theme values go in `globals.css` using `@theme inline { }` blocks.
- Use the design tokens from SPEC.md. The color palette is dark-only:
  - Page background: `#09090b`
  - Editor card surface: `#141416`
  - Borders: `rgba(255,255,255,0.06)` — use `border-white/6` in Tailwind
  - Text primary: `#ededef`
  - Text muted / placeholders: `#5a5a5a`
- Keep class lists readable. For long class strings, break them across multiple lines.
- **Dark mode is the only mode.** Hardcode dark colors directly — no light mode, no `prefers-color-scheme` toggling.

### State Management

- Use React `useState`. No external state libraries (no Redux, Zustand, Jotai, etc.).
- The component tree is very shallow: `NotepadApp` → `Toolbar` + `Editor` + `StorageWarning`. Simple prop drilling.
- Do NOT use React Context. Unnecessary for this scope.

### localStorage

- Single key: `notepad_data`
- Always wrap `localStorage` calls in try/catch (quota exceeded, SSR, private browsing).
- Debounce writes at 300ms — never write on every keystroke directly.
- On first load with no data, show empty editor with placeholder text.

### Imports

- Use the `@/*` path alias (maps to `./src/*`). Example: `import { NotepadData } from "@/types"`.
- Imports are always at the top of the file. Never import mid-file.
- Group imports: (1) React/Next, (2) third-party, (3) internal `@/*`.

### Dependencies

When adding new packages, use `bun add <package>`. Key packages to install:

- `lucide-react` — toolbar icons
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `@tiptap/extension-link`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-code-block-lowlight`, `lowlight` — editor

Do NOT add packages that aren't needed. Keep the dependency footprint small.

---

## Things to Avoid

- **No `console.log` in production code.** Use it only for debugging, then remove.
- **No `// @ts-ignore` or `// @ts-expect-error`** unless there's a documented Tiptap/library typing issue.
- **No server-side data fetching.** This app has zero API routes and zero server actions. Everything is client-side.
- **No `useEffect` for derived state.** Compute derived values inline or with `useMemo`.
- **No CSS modules, styled-components, or emotion.** Tailwind only.
- **No sidebar, no multi-note UI, no navigation.** This is a single writing surface.
- **Do not over-engineer.** This is a simple notepad. No complex abstractions, no DI, no factories.

---

## Testing

No test framework is set up yet. If adding tests:

- Use Vitest (compatible with Bun and Next.js)
- Test hooks and utilities, not UI components (for v1)
- Place tests next to the file they test: `useLocalStorage.test.ts` beside `useLocalStorage.ts`

---

## Common Pitfalls

1. **SSR + localStorage**: Next.js renders on the server first. Guard all `localStorage` access with `typeof window !== "undefined"` or only access it inside `useEffect`.
2. **Tailwind v4 ≠ v3**: No `tailwind.config.js`, no `@apply` in most cases, no `theme.extend`. Use `@theme inline {}` in CSS for custom tokens.
3. **Next.js 16 + React 19**: `use()` hook is available but not required. Stick to `useState`/`useEffect` for simplicity.
4. **Base64 image size**: A single pasted screenshot can be 1–3MB. localStorage has a ~5–10MB limit. Always check remaining space before saving.
5. **Tiptap + Next.js SSR**: Tiptap must be rendered client-side only. Use dynamic import with `ssr: false` or gate rendering behind a `mounted` check.

---

## Commit Guidance

- Atomic commits: one logical change per commit
- Conventional commit messages: `feat:`, `fix:`, `refactor:`, `style:`, `chore:`
- Don't commit `node_modules/`, `.next/`, or `bun.lock` changes unless dependencies changed
