# Homespace

A personal productivity app combining a Notion-like page editor with a gym workout tracker. Built with Next.js 15, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Auth**: Supabase SSR
- **Database**: PostgreSQL via Prisma ORM
- **Editor**: BlockNote (rich text blocks)
- **Drawing**: tldraw (freehand canvas)
- **Theming**: next-themes (dark/light mode)
- **PWA**: Serwist service worker

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Supabase and database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

### Pages & Editor

- Create, edit, and delete pages with a rich text editor (BlockNote)
- Auto-saving content with debounce
- Inline page title editing with real-time sidebar sync
- Page emoji/icons with a picker (96 emojis, 6 categories)
- Nested sub-pages with breadcrumb navigation
- tldraw drawing blocks embedded in pages with auto-save
- Collapsible sidebar with recursive page tree

### Dark Mode

- System-aware theme toggle in sidebar
- Synced across BlockNote editor, tldraw canvas, and all UI components

### GymQuest Workout Tracker

A full-featured gym tracker at `/gym` with a custom GymQuest-styled UI.

**Dashboard** (`/gym`):
- Workout stats (total sessions, current streak, weekly count)
- Contribution heatmap with clickable day navigation
- Weekly schedule overview (Push/Pull/Legs split)
- Today's workout preview

**Workout Log** (`/gym/log`):
- GymQuest-branded header with split day badge and muscle group summary
- This Week strip with 7 clickable day cards showing attendance status
- Goal hero card with horizontal progress bar and collapsible Candy Land serpentine roadmap
- 1RM trend chart tracking estimated one-rep max over time
- Smart weight/rep suggestions based on previous sessions
- Exercise cards with weight and rep steppers (5 lb increments)
- Live estimated 1RM display below each set (Epley formula)
- Click any stepper value to reset to exercise defaults
- Per-exercise default weights and reps (Bench 135/8, Deadlift 225/5, Squat 95/5, etc.)
- Rest timers after completing sets
- Session insights comparing current vs previous performance
- Session notes with auto-save
- All data persisted to localStorage

**Workout Schedule**:
- Fixed weekly PPL split: Sun (Pull), Mon (Legs), Tue (Rest), Wed (Push), Thu (Pull), Fri (Legs), Sat (Push)
- 2 sets per exercise across all splits

## Project Structure

```
src/
  app/
    (main)/
      [pageId]/        # Dynamic page view
      gym/             # Gym dashboard
      gym/log/         # Workout log
    api/               # REST API routes
    auth/              # Auth callback
  components/
    editor/            # BlockNote editor
    drawing/           # tldraw canvas
    sidebar/           # App sidebar
    gym/               # Gym tracker components
    ui/                # shadcn/ui components
  hooks/               # Custom hooks (gym storage, etc.)
  lib/                 # Utilities (Supabase client, Prisma, etc.)
prisma/
  schema.prisma        # Database schema
```

## Database Schema

Key models:

- **Page** — id, title, icon, parentId (self-referential for nesting), coverImage, isArchived, sortOrder
- **Block** — page content blocks (BlockNote JSON)
- **Drawing** — tldraw canvas state per page

Gym data is stored in localStorage (no server-side persistence).
