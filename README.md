# Berkeleytime Clone

A from-scratch React/TypeScript implementation of a UC Berkeley course-discovery + degree-planning app, built on real data scraped from [berkeleytime.com](https://berkeleytime.com)'s public GraphQL API and the official Berkeley catalog.

## Features

- **Catalog** — browse 5,600 Fall 2026 classes with rich data (instructors, schedule, location, RMP rating, grade history, enrollment chart). 10 filter dimensions including the new RMP-rating filter (`>1`/`>2`/`>3`/`>3.5`/`>4`/`>4.5`/`5`).
- **Scheduler** — weekly calendar; add classes + custom events; iCal export for Google/Apple Calendar; share schedule via URL.
- **Gradtrak** — degree audit across **234 programs** (120 majors + 113 minors + 1 college), powered by berkeleytime's `BtLL` requirement definitions plus our own breadth/uni-req heuristics. Multi-plan support, plan diff, graduation planner, "Plan my path" Claude prompt builder, CalCentral paste-import, CSV export, share via URL.
- **Grades** — per-(course, instructor, semester) grade distributions across 12,661 unique courses.
- **Enrollment** — daily snapshots of per-section enrollment with phase markers.

## Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **State**: Zustand with localStorage persistence
- **Charts**: Recharts
- **Data**: scraped from berkeleytime GraphQL + Berkeley Academic Guide; processed in `data-pipeline/`

## Local Setup

```bash
npm install
npm run dev   # http://localhost:5173
```

## Project Structure

```
src/
├── App.tsx                  # Routes
├── main.tsx                 # Entry
├── pages/                   # Route components (Catalog, Scheduler, Gradtrak, Grades, Enrollment)
├── components/
│   ├── catalog/             # Catalog page (sidebar filters, list, detail panel, charts)
│   ├── scheduler/           # Scheduler (sidebar, weekly calendar, add-event modal)
│   ├── gradtrak/            # Gradtrak (program selector, semester block, progress view, plan diff, graduation planner)
│   ├── shared/              # Shared (CourseSearch)
│   ├── layout/              # PageLayout, Navbar, ThreeColumnLayout
│   └── ui/                  # Reusable atoms (Dropdown, MultiSelect, Tabs, etc.)
├── stores/                  # Zustand stores (data, catalog, allCourses, schedule, theme, gradtrak)
├── utils/                   # Pure helpers (matchers, exporters, conflict-check, prereq-check, etc.)
├── hooks/                   # useDebounce, useFilteredCourses
└── types/                   # Shared TypeScript types

public/data/                 # Shipped JSON (loaded at runtime)
├── courses.json             # ~108 MB — Fall 2026 with rich grade+enrollment history
├── all-courses.json         # ~9 MB — 12,661 courses with breadths, prereqs, uni-reqs
└── programs.json            # ~640 KB — 234 degree programs with requirement rules

data-pipeline/               # Node scripts to regenerate the above (not bundled)
```

## Data Pipeline

See [`data-pipeline/README.md`](data-pipeline/README.md) for scrape commands and data sources.

## V3 Roadmap (deferred items)

- **Backend persistence (CalNet OAuth)** — currently localStorage-only. Planned for post-V3.
- **Course advice chatbot** — skipped per design direction.
- **Mobile app** — future.

## License

MIT
