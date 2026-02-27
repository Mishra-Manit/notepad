# Notepad — Project Specification

## Overview

A single-screen, distraction-free notepad that lives in your browser. Open a tab, start typing. All content is saved to **localStorage** — no backend, no accounts, no network requests. The aesthetic is inspired by Linear's dark UI: deep blacks, crisp typography, and beautiful negative space.

This is **not** a multi-note app. It's one writing surface — a scratchpad for drafting messages, pasting snippets, jotting thoughts between tasks.

---

## Design Reference

The UI follows Linear's visual sensibility, distilled to a single-page editor:

- **Color palette**: Deep black background (`#09090b`). The editor surface is a subtly lighter card (`#141416`). Text is off-white (`#ededef`). Muted secondary text / placeholders in `#5a5a5a`. Borders: `rgba(255,255,255,0.06)` — barely-there separators.
- **Typography**: **Inter** (or Geist Sans as fallback). 16px base for body text, clean line-height (1.7). The font should feel premium — smooth, well-kerned, modern.
- **Layout**: Centered column, `max-w-2xl` (~672px), vertically padded. The writing area should feel like a blank page floating in darkness.
- **Transitions**: Subtle — 150ms ease for focus states and toolbar hovers. No flashy animations.
- **Radius**: 8px on the main card, 6px on buttons/inputs.
- **Controls**: No toolbar, no status/footer UI. The surface is just a clean writing area.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     (dark background)                       │
│                                                             │
│            ┌───────────────────────────────┐                │
│            │                               │                │
│            │   Start typing...             │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            │                               │                │
│            └───────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Main Surface

- Centered on the page, `max-w-2xl`, with generous vertical padding (`py-12` or more)
- The card has the subtle darker surface color and a faint border
- The editor fills the card and grows with content (no fixed height — the card stretches)
- Minimum height: `min-h-[60vh]` so it always feels substantial even when empty
- Placeholder text: "Start typing..." in muted color, disappears on focus/input
- No toolbar and no footer; the writing area starts near the top with comfortable padding (`pt-10`-ish) and side padding (`px-8`-ish)

---

## Features

### Core

1. **Single writing surface** — One note, always open. No note switching, no sidebar, no navigation.
2. **Auto-save** — Content is debounce-saved to localStorage on every keystroke (300ms). User never has to think about saving.
3. **Persistent** — Content survives page reloads, browser restarts, and tab closes.
4. **Clear all** — A subtle button (or `Cmd+Shift+Backspace`) to clear the entire notepad, with a confirmation dialog.

### Markdown / Rich Text

5. **Markdown input rules** — Type `#` for heading, `**` for bold, `` ` `` for code, `-` for list, etc. The editor converts these to styled text inline (WYSIWYG).
6. **Supported syntax**: Headings (H1–H3), bold, italic, strikethrough, inline code, code blocks, blockquotes, ordered/unordered lists, checkboxes/task lists, horizontal rules, links.

### Image Support

8. **Paste images** — Intercept `paste` events containing image data. Convert to base64 data URL, embed inline.
9. **Drag-and-drop images** — Drop image files into the editor to embed them.
10. **Image rendering** — Images display inline with `max-w-full`, capped at the editor width. Rounded corners (4px).

### Keyboard Shortcuts

12. `Cmd/Ctrl + B` — Bold
13. `Cmd/Ctrl + I` — Italic
14. `Cmd/Ctrl + K` — Insert link
15. `Cmd/Ctrl + Shift + C` — Toggle code block
16. `Cmd/Ctrl + Shift + Backspace` — Clear all (with confirmation)

---

## Data Model

All data lives in localStorage under a single key: `notepad_data`.

```typescript
interface NotepadData {
  content: string;     // HTML string from the editor (Tiptap JSON or HTML)
  updatedAt: string;   // ISO 8601 — last save timestamp
}
```

- On app load: read `notepad_data` from localStorage, parse JSON, hydrate editor
- On every change: debounced write back to localStorage
- If localStorage is empty on first load: show empty editor with placeholder

---

## Tech Stack

| Layer        | Choice                                |
| ------------ | ------------------------------------- |
| Framework    | Next.js 16 (App Router)              |
| Language     | TypeScript (strict mode)              |
| Styling      | Tailwind CSS v4                       |
| Font         | Inter (via `next/font/google`)        |
| Icons        | Lucide React                          |
| Editor       | Tiptap (ProseMirror-based)            |
| State        | React `useState`                      |
| Persistence  | localStorage (no backend)             |
| Package mgr  | Bun                                   |
| Linting      | ESLint (next config)                  |

### Editor Library Decision

**Tiptap** is the recommended editor because:
- Handles markdown input rules natively (type `#` → heading, `**` → bold, etc.)
- Supports image nodes, paste handling, and drag-and-drop out of the box
- ProseMirror-based — battle-tested and extensible
- Works well in React/Next.js
- Gives us a WYSIWYG experience with zero extra rendering logic

---

## Component Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, Inter font, global CSS
│   ├── page.tsx            # Renders <NotepadApp />
│   └── globals.css         # Tailwind imports, dark theme tokens
├── components/
│   ├── NotepadApp.tsx      # Top-level client component, state + persistence
│   ├── Editor.tsx          # Tiptap editor wrapper
│   
├── hooks/
│   ├── useLocalStorage.ts  # Read/write localStorage with debounce
│   └── useKeyboardShortcuts.ts  # Global shortcut handler
├── lib/
│   ├── storage.ts          # localStorage helpers, size calculation
│   ├── constants.ts        # localStorage key, size limits
│   └── utils.ts            # Misc utilities
└── types/
    └── index.ts            # TypeScript interfaces (NotepadData)
```

---

## Non-Goals (Out of Scope)

- Multiple notes / note switching / sidebar
- User authentication / accounts
- Cloud sync or any backend
- Collaboration / real-time editing
- Export/import functionality
- Light mode (dark only for v1)
- PWA / offline support beyond what localStorage already provides
- Mobile-native app

---

## Performance Considerations

- **localStorage limit**: ~5–10MB depending on browser. Base64 images eat this fast.
- **Debounced saves**: Don't write to localStorage on every keystroke — debounce at 300ms.
- **Editor performance**: Tiptap handles large documents well. Keep the component tree shallow.
- **SSR**: The editor must render client-side only. Use `"use client"` and guard against SSR.

---

## Acceptance Criteria

1. App loads with a single centered editor on a dark background
2. User can type and format text with markdown shortcuts
3. Content persists across page reloads via localStorage
4. User can paste images from clipboard and see them rendered inline
5. User can drag-and-drop images into the editor
6. Markdown syntax works: headings, bold, italic, code, lists, links, blockquotes, horizontal rules
7. Keyboard shortcuts work (bold, italic, link, code block, clear all)
8. UI is dark-themed, centered, clean, and visually inspired by Linear
9. Typography feels premium (Inter font, good spacing)
10. App works in Chrome, Firefox, Safari (latest versions)
11. No console errors, no layout shifts, no broken states on empty data
