# Homespace — Project Status

## Overview

Homespace is a personal Notion-like productivity app built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase Auth, Prisma ORM, BlockNote editor, and tldraw drawing canvas.

**Repo location**: `/Users/aidilrozi/homespace`

---

## Architecture

- **Framework**: Next.js 15 App Router (`src/app/`)
- **Auth**: Supabase SSR (`@supabase/ssr`)
- **Database**: PostgreSQL via Prisma ORM (`prisma/schema.prisma`)
- **Editor**: BlockNote (`@blocknote/react`) for rich text blocks
- **Drawing**: tldraw (`tldraw`) for freehand drawing canvases
- **UI**: shadcn/ui components (`src/components/ui/`), Tailwind CSS v4
- **Theming**: `next-themes` with `attribute="class"` (toggles `.dark` on `<html>`)
- **State sync**: Custom DOM events for cross-component communication (no state management library)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with ThemeProvider |
| `src/app/(main)/[pageId]/page.tsx` | Page view (title, emoji, breadcrumbs, editor, drawings) |
| `src/components/sidebar/app-sidebar.tsx` | Sidebar with collapsible page tree, theme toggle, sign out |
| `src/components/editor/block-editor.tsx` | BlockNote editor wrapper with dark mode |
| `src/components/drawing/drawing-canvas.tsx` | tldraw canvas with dark mode sync |
| `src/components/drawing/drawing-block.tsx` | Drawing block container with toolbar |
| `src/components/emoji-picker.tsx` | Emoji picker popover (96 emojis, 6 categories) |
| `src/components/ui/` | shadcn/ui components (button, popover, dropdown-menu, sidebar, etc.) |
| `src/app/api/pages/route.ts` | List/create pages API |
| `src/app/api/pages/[pageId]/route.ts` | Get/update/delete page API |
| `src/app/api/pages/[pageId]/content/route.ts` | Page content (BlockNote JSON) API |
| `src/app/api/pages/[pageId]/drawings/route.ts` | Page drawings API |
| `src/app/globals.css` | Global styles, CSS variables, sidebar overrides |
| `prisma/schema.prisma` | Database schema |

---

## Completed Features

### 1. Core Page System
- CRUD operations for pages
- Rich text editing with BlockNote (code blocks, toggles, headings, etc.)
- Auto-saving content with debounce

### 2. Drawing Blocks
- tldraw-based drawing canvas embedded in pages
- Add/delete drawing blocks
- Auto-save drawing state
- Pen detection auto-enables editing mode
- Locked/editing toggle with toolbar buttons

### 3. Sidebar Navigation
- Collapsible page tree with nested sub-pages
- Chevron toggle to expand/collapse children
- Active page highlighted, ancestors auto-expanded
- Create new top-level pages (+) or sub-pages (via dropdown)
- Delete pages (soft delete/archive)
- Real-time title and icon sync via custom DOM events

### 4. Inline Page Title Editing
- Editable title input with debounced auto-save
- Sidebar updates in real-time via `page-title-updated` custom event

### 5. Page Icons/Emoji
- Emoji picker popover with 96 emojis across 6 categories
- Click existing emoji to change/remove
- "Add icon" button appears on hover when no icon set
- Sidebar updates in real-time via `page-icon-updated` custom event
- Persists via API

### 6. Dark Mode
- Toggle in sidebar footer (Moon/Sun icon)
- `next-themes` with `attribute="class"`, `defaultTheme="system"`
- BlockNote editor: dynamic `theme` prop using `resolvedTheme`
- tldraw canvas: `editor.user.updateUserPreferences({ colorScheme })` sync
- Sidebar active/hover overrides use `:is(.dark *)` selector (Tailwind v4 strips plain `.dark`)
- shadcn button outline variant: `dark:bg-secondary dark:border-secondary`
- Hydration mismatch prevention with `mounted` state pattern

### 7. Nested/Sub-Pages
- Database supports full hierarchy (`parentId`, self-referential `PageHierarchy` relation)
- Sidebar renders recursive tree with `SidebarMenuSub`
- "New sub-page" in page dropdown menu
- Parent auto-expands when sub-page created
- Breadcrumb navigation above title (clickable, shows parent chain)
- PATCH API supports `parentId` updates

---

## Known Patterns & Gotchas

### Tailwind CSS v4
- Plain `.dark` CSS selectors get stripped by Tailwind v4 processing
- Must use `:is(.dark *)` or Tailwind's `@custom-variant dark` for dark mode overrides
- The project uses `@custom-variant dark (&:is(.dark *));` in globals.css

### tldraw Dark Mode
- `inferDarkMode` prop reads `prefers-color-scheme` media query, NOT the `.dark` class
- Must manually sync via `editor.user.updateUserPreferences({ colorScheme: 'dark' | 'light' })`
- Use `themeRef` pattern to access current theme inside `handleMount` callback

### Cross-Component Sync
- Title changes: `window.dispatchEvent(new CustomEvent("page-title-updated", { detail: { pageId, title } }))`
- Icon changes: `window.dispatchEvent(new CustomEvent("page-icon-updated", { detail: { pageId, icon } }))`
- Sidebar listens for both events and updates local state

### Hydration
- Theme-dependent UI (Sun/Moon icons) uses `mounted` state: `const [mounted, setMounted] = useState(false)` with `useEffect(() => setMounted(true), [])`

---

## Database Schema (Key Models)

```prisma
model Page {
  id          String    @id @default(uuid())
  workspaceId String
  parentId    String?               // Self-referential for nesting
  title       String    @default("Untitled")
  icon        String?
  coverImage  String?
  isArchived  Boolean   @default(false)
  sortOrder   Int       @default(0)
  blocks      Block[]
  parent      Page?     @relation("PageHierarchy", fields: [parentId], references: [id])
  children    Page[]    @relation("PageHierarchy")
}
```

---

## Potential Next Features

1. **Page reordering (drag & drop)** — `sortOrder` field exists, needs dnd-kit or similar
2. **Search (Cmd+K)** — Quick-search dialog to find pages by title
3. **Cover images** — `coverImage` field exists in DB, needs upload UI
4. **Trash/restore** — `isArchived` field exists, needs trash view UI to restore
5. **Keyboard shortcuts** — Navigation shortcuts, quick actions
6. **Favorites/pinned pages** — Pin frequently used pages to sidebar top
7. **Mobile PWA improvements** — Service worker already set up via Serwist
