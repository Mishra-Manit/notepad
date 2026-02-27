# Notepad — Project Specification

## Overview

A minimal, fast, browser-based notepad for quickly capturing text, links, code snippets, and images between tasks. All data is persisted in **localStorage** — no backend, no accounts, no network requests. The UI is heavily inspired by [Linear](https://linear.app): dark-first, tight spacing, crisp typography, subtle borders, and restrained use of color.

---

## Design Reference

The UI follows Linear's visual language:

- **Color palette**: Dark background (`#0a0a0a`–`#141414`), with subtle lighter surfaces (`#1a1a1a`–`#1f1f1f`) for cards/sidebar. Text is off-white (`#ededed`) with muted secondary text (`#888`–`#a0a0a0`). Accent color is a warm amber/yellow (`#f5a623` or similar) used sparingly for active states and highlights.
- **Typography**: Inter or Geist Sans. 13–14px base, medium weight for headings, regular for body. Tight line-height.
- **Borders**: `1px solid rgba(255,255,255,0.06)` — barely visible separators, never heavy.
- **Spacing**: Compact but breathable. 12–16px padding in sidebar items, 20–32px padding in main content.
- **Icons**: Lucide icon set, 16px, stroke-width 1.5, muted color unless active.
- **Transitions**: Subtle — 150ms ease for hovers and focus states. No flashy animations.
- **Radius**: Minimal — 4–6px on cards and inputs, 4px on buttons.

---

## Layout

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main Content Area         │
│                         │                            │
│  [App Logo / Title]     │  [Note Title]              │
│                         │  [Toolbar — formatting]    │
│  ── Notes ──            │                            │
│  • Note 1 (active)      │  [Editor area]             │
│  • Note 2               │                            │
│  • Note 3               │                            │
│                         │                            │
│  [+ New Note]           │                            │
│                         │                            │
│                         │                            │
│  ── bottom ──           │                            │
│  [Settings gear]        │                            │
└──────────────────────────────────────────────────────┘
```

### Sidebar

- Fixed 240px width, dark background slightly lighter than the main bg
- Top: App name ("Notepad") with a small icon
- Middle: Scrollable list of notes, sorted by last-modified (most recent first)
- Each note item shows: title (first line or "Untitled"), truncated preview (second line), and relative timestamp
- Active note is highlighted with a subtle left-border accent and slightly lighter bg
- Hover state on items: lighter bg
- Bottom: "+ New Note" button, settings icon
- On mobile (<768px): sidebar collapses to a hamburger menu overlay

### Main Content Area

- Fills remaining width
- Top bar: Note title (editable inline, rendered as an `<input>` or contentEditable `<h1>`)
- Below title: Minimal formatting toolbar (bold, italic, code, heading, link, image upload, checklist)
- Editor: Full-height markdown-capable text area
- Bottom (optional/subtle): Word count, last saved timestamp

---

## Features

### Core

1. **Create notes** — Click "+ New Note" or use `Cmd+N` / `Ctrl+N`
2. **Edit notes** — Click a note in the sidebar to open it in the editor
3. **Delete notes** — Right-click context menu or a trash icon; confirm before deleting
4. **Auto-save** — Debounced save to localStorage on every keystroke (300ms debounce)
5. **Note list** — Sidebar shows all notes, sorted by `updatedAt` desc

### Markdown

6. **Markdown editing** — The editor supports markdown syntax input
7. **Live preview / hybrid mode** — Render markdown inline as the user types (WYSIWYG-like), OR provide a toggle between edit and preview modes. Prefer inline rendering (like Notion/Linear) if feasible with the chosen editor library.
8. **Supported syntax**: Headings (H1–H3), bold, italic, strikethrough, inline code, code blocks (with syntax highlighting), blockquotes, ordered/unordered lists, checkboxes/task lists, horizontal rules, links

### Image Support

9. **Paste images** — Intercept `paste` events containing image data. Convert the image to a base64 data URL and embed it inline in the note content.
10. **Drag-and-drop images** — Support dropping image files into the editor
11. **Image rendering** — Embedded images display inline in the editor at a reasonable max-width (e.g., `max-w-full` capped at 600px)
12. **Storage note**: Base64 images are large. Display a subtle warning if total localStorage usage exceeds 4MB.

### Keyboard Shortcuts

13. `Cmd/Ctrl + N` — New note
14. `Cmd/Ctrl + Backspace` — Delete current note (with confirmation)
15. `Cmd/Ctrl + B` — Bold
16. `Cmd/Ctrl + I` — Italic
17. `Cmd/Ctrl + K` — Insert link
18. `Cmd/Ctrl + Shift + C` — Toggle code block
19. `Cmd/Ctrl + P` — Toggle markdown preview (if applicable)

### Search

20. **Search notes** — A search input at the top of the sidebar filters notes by title and content in real time

---

## Data Model

All data lives in localStorage under a single key: `notepad_data`.

```typescript
interface Note {
  id: string;          // nanoid or crypto.randomUUID()
  title: string;       // extracted from first line, or "Untitled"
  content: string;     // raw markdown string (images as base64 data URLs)
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

interface AppState {
  notes: Note[];
  activeNoteId: string | null;
  sidebarCollapsed: boolean;
}
```

- On app load: read `notepad_data` from localStorage, parse JSON, hydrate state
- On every state change: debounced write back to localStorage
- If localStorage is empty on first load: create a single welcome note with usage instructions

---

## Tech Stack

| Layer        | Choice                                |
| ------------ | ------------------------------------- |
| Framework    | Next.js 16 (App Router)              |
| Language     | TypeScript (strict mode)              |
| Styling      | Tailwind CSS v4                       |
| Icons        | Lucide React                          |
| Editor       | Tiptap (ProseMirror-based) or similar |
| Markdown     | Tiptap markdown extension or remark   |
| State        | React `useState` + `useReducer`       |
| Persistence  | localStorage (no backend)             |
| Package mgr  | Bun                                   |
| Linting      | ESLint (next config)                  |

### Editor Library Decision

**Tiptap** is the recommended editor because:
- It handles markdown input rules natively (type `#` → heading, `**` → bold, etc.)
- It supports image nodes, paste handling, and drag-and-drop out of the box
- ProseMirror-based — battle-tested and extensible
- Works well in React/Next.js

If Tiptap feels too heavy, a lighter alternative is a plain `<textarea>` with a separate markdown preview pane using `react-markdown` + `remark-gfm`.

---

## Component Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, global CSS
│   ├── page.tsx            # Main app entry — renders <NotepadApp />
│   └── globals.css         # Tailwind imports, CSS variables, dark theme
├── components/
│   ├── NotepadApp.tsx      # Top-level client component, state management
│   ├── Sidebar.tsx         # Sidebar with note list, search, new note button
│   ├── NoteItem.tsx        # Single note entry in sidebar
│   ├── Editor.tsx          # Main editor component (Tiptap or textarea)
│   ├── Toolbar.tsx         # Formatting toolbar above editor
│   ├── SearchInput.tsx     # Search bar in sidebar
│   └── StorageWarning.tsx  # Warning banner when localStorage is near full
├── hooks/
│   ├── useLocalStorage.ts  # Read/write localStorage with debounce
│   ├── useNotes.ts         # CRUD operations on notes array
│   └── useKeyboardShortcuts.ts  # Global keyboard shortcut handler
├── lib/
│   ├── storage.ts          # localStorage helpers, size calculation
│   ├── constants.ts        # Keys, defaults, limits
│   └── utils.ts            # Misc utilities (date formatting, id generation)
└── types/
    └── index.ts            # TypeScript interfaces (Note, AppState, etc.)
```

---

## Non-Goals (Out of Scope)

- User authentication / accounts
- Cloud sync or any backend
- Collaboration / real-time editing
- Note folders or tags (keep it flat for v1)
- Export/import (can be added later)
- PWA / offline support beyond what localStorage already provides
- Mobile-native app

---

## Performance Considerations

- **localStorage limit**: ~5–10MB depending on browser. Base64 images eat this fast. Show a usage indicator and warn at 4MB.
- **Debounced saves**: Don't write to localStorage on every keystroke — debounce at 300ms.
- **Large note lists**: Unlikely to be an issue at notepad scale, but use `useMemo` on filtered/sorted note lists.
- **Editor performance**: Tiptap handles large documents well. Avoid re-rendering the entire editor on sidebar interactions.

---

## Acceptance Criteria

1. User can create, edit, and delete notes
2. Notes persist across page reloads via localStorage
3. User can paste images from clipboard and see them rendered inline
4. Markdown syntax is supported (at minimum: headings, bold, italic, code, lists, links)
5. UI is dark-themed, clean, and visually similar to Linear's aesthetic
6. Sidebar shows all notes with search filtering
7. Keyboard shortcuts work for common actions
8. App works in Chrome, Firefox, Safari (latest versions)
9. No console errors, no layout shifts, no broken states on empty data
