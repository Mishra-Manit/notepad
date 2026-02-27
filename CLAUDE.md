# CLAUDE.md — Agent Coding Guidelines

This file provides instructions for AI coding agents (Claude, Windsurf Cascade, Cursor, etc.) working on the Notepad project. Read this before writing any code.

---

## Project Summary

A browser-based notepad app with a Linear-inspired dark UI. No backend — all persistence via localStorage. See `SPEC.md` for full requirements.

---

## Tech Stack & Versions

- **Framework**: Next.js 16 (App Router) — do NOT use Pages Router
- **React**: 19.2.3
- **TypeScript**: 5.x, strict mode enabled
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` — do NOT use Tailwind v3 syntax or `tailwind.config.js`
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
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions, constants, storage helpers
└── types/         # TypeScript type definitions
```

- One component per file. File name matches component name (`Sidebar.tsx` → `export function Sidebar`).
- Hooks go in `src/hooks/`, named `use*.ts`.
- Pure utility functions go in `src/lib/`.

### Styling

- **Tailwind CSS v4 only.** No inline `style={{}}` unless absolutely necessary (e.g., dynamic values).
- Tailwind v4 uses `@import "tailwindcss"` in CSS — there is no `tailwind.config.js`. Custom theme values go in `globals.css` using `@theme inline { }` blocks.
- Use the design tokens from SPEC.md. The color palette is dark-first:
  - Background: `#0a0a0a` to `#141414`
  - Surface/sidebar: `#1a1a1a` to `#1f1f1f`
  - Borders: `rgba(255,255,255,0.06)` — use `border-white/6` in Tailwind
  - Text primary: `#ededed`
  - Text secondary: `#888` to `#a0a0a0`
  - Accent: amber/yellow `#f5a623`
- Keep class lists readable. For long class strings, break them across multiple lines.
- Use Tailwind's dark mode only if supporting light mode. For v1, **dark mode is the only mode** — hardcode dark colors directly.

### State Management

- Use React `useState` and `useReducer`. No external state libraries (no Redux, Zustand, Jotai, etc.).
- All state flows through the top-level `NotepadApp` component and is passed down via props.
- Do NOT use React Context for v1. The component tree is shallow enough for prop drilling.

### localStorage

- Single key: `notepad_data`
- Always wrap `localStorage` calls in try/catch (quota exceeded, SSR, private browsing).
- Debounce writes at 300ms — never write on every keystroke directly.
- On first load with no data, create a welcome note.

### Imports

- Use the `@/*` path alias (maps to `./src/*`). Example: `import { Note } from "@/types"`.
- Imports are always at the top of the file. Never import mid-file.
- Group imports: (1) React/Next, (2) third-party, (3) internal `@/*`.

### Dependencies

When adding new packages, use `bun add <package>`. Key packages to install:

- `lucide-react` — icons
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `@tiptap/extension-link`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-code-block-lowlight` — editor (if using Tiptap)
- `nanoid` — ID generation (or use `crypto.randomUUID()`)

Do NOT add packages that aren't needed. Keep the dependency footprint small.

---

## Things to Avoid

- **No `console.log` in production code.** Use it only for debugging, then remove.
- **No `// @ts-ignore` or `// @ts-expect-error`** unless there's a documented Tiptap/library typing issue.
- **No server-side data fetching.** This app has zero API routes and zero server actions. Everything is client-side.
- **No `useEffect` for derived state.** Compute derived values inline or with `useMemo`.
- **No CSS modules, styled-components, or emotion.** Tailwind only.
- **No `<img>` tags.** Use Next.js `<Image />` for static assets. For base64 pasted images in the editor, the editor library handles rendering (an `<img>` inside Tiptap's node view is acceptable).
- **Do not over-engineer.** This is a simple notepad. No complex abstractions, no DI, no factories.

---

## Testing

No test framework is set up yet. If adding tests:

- Use Vitest (compatible with Bun and Next.js)
- Test hooks and utilities, not UI components (for v1)
- Place tests next to the file they test: `useNotes.test.ts` beside `useNotes.ts`

---

## Common Pitfalls

1. **SSR + localStorage**: Next.js renders on the server first. Guard all `localStorage` access with `typeof window !== "undefined"` or only access it inside `useEffect`.
2. **Tailwind v4 ≠ v3**: No `tailwind.config.js`, no `@apply` in most cases, no `theme.extend`. Use `@theme inline {}` in CSS for custom tokens.
3. **Next.js 16 + React 19**: `use()` hook is available but not required. Stick to `useState`/`useEffect`/`useReducer` for simplicity.
4. **Base64 image size**: A single pasted screenshot can be 1–3MB. localStorage has a ~5–10MB limit. Always check remaining space before saving.
5. **Tiptap + Next.js SSR**: Tiptap must be rendered client-side only. Use dynamic import with `ssr: false` or gate rendering behind a `mounted` check.

---

## Commit Guidance

- Atomic commits: one logical change per commit
- Conventional commit messages: `feat:`, `fix:`, `refactor:`, `style:`, `chore:`
- Don't commit `node_modules/`, `.next/`, or `bun.lock` changes unless dependencies changed
