# Product Requirements Document: Berkeleytime Clone

## Project Overview

A full-featured UC Berkeley course discovery and schedule planning web application, modeled closely after [berkeleytime.com](https://berkeleytime.com). The app enables students to search, filter, and explore courses; view grade distributions and enrollment trends; and build weekly schedules with both classes and custom events.

**Target Stack:** React (Next.js or Vite), TypeScript, Tailwind CSS, dark theme by default.
**Data:** Seed the app with realistic mock data for **Fall 2026** semester (and historical semesters for grade/enrollment views). All data lives in a local JSON seed file — no external API calls.

---

## 1. Global Layout & Navigation

### 1.1 Top Navigation Bar (persistent across all pages)

- **Left:** App logo/wordmark — "Berkeleytime" in bold white text.
- **Right nav links** (horizontal): `Catalog` | `Scheduler` | `Gradtrak` | `Grades` | `Enrollment`
- **Dark mode toggle** (moon icon) — app defaults to dark mode.
- **Sign In button** (blue outline pill) at far right with arrow icon.
- Active page link has underline or highlight treatment.
- Navbar is sticky at the top of the viewport.

### 1.2 Color Palette & Theme (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#1a1a2e` | Page background |
| `--bg-card` | `#16213e` or `#1e1e30` | Cards, sidebar |
| `--bg-hover` | `#2a2a4a` | Hovered list items |
| `--bg-selected` | `#0f3460` | Selected/active list item |
| `--text-primary` | `#e0e0e0` | Body text |
| `--text-secondary` | `#888` | Muted labels |
| `--accent-blue` | `#4a90d9` | Links, active tabs |
| `--accent-green` | `#4caf50` | Open seats / low enrollment |
| `--accent-red` | `#e53935` | High enrollment, alerts |
| `--accent-orange` | `#ff9800` | Moderate enrollment |
| `--accent-yellow` | `#ffd740` | Stars, favorites |
| `--border` | `#333` | Dividers, card borders |

---

## 2. Catalog Page (`/catalog`)

The primary course browsing experience. Three-column layout:

```
┌──────────────┬────────────────────┬─────────────────────────────────┐
│   FILTERS    │   CLASS LIST       │     CLASS DETAIL PANEL          │
│   SIDEBAR    │   (scrollable)     │     (scrollable)                │
│   (~250px)   │   (~320px)         │     (remaining width)           │
└──────────────┴────────────────────┴─────────────────────────────────┘
```

### 2.1 Left Sidebar — Filters

All filters update the class list in real time. A "Clear" link at the top resets all filters.

#### 2.1.1 Semester (Dropdown)
- Options: `Fall 2026` (default/selected), `Summer 2026`, `Spring 2026`, `Fall 2025`, `Summer 2025`, `Spring 2025`, `Fall 2024`
- Only Fall 2026 needs to have populated course data. Other semesters can show empty results.

#### 2.1.2 Sort By (Dropdown + toggle)
- Options: `Relevance` (default), `Average Grade` (highest first), `Enrolled Percentage`, `Units`, `Course Number`, `Department`
- Small icon button to the right of the dropdown to toggle ascending/descending sort.

#### 2.1.3 Class Level (Multi-select dropdown)
- Options: `Lower Division` (1–99), `Upper Division` (100–199), `Graduate` (200+)

#### 2.1.4 Requirements (Multi-select dropdown)
Two categories of requirements. Each has sub-options that can be independently selected:

**Letters & Science Breadth:**
- Arts and Literature
- Biological Science
- Historical Studies
- International Studies
- Philosophy and Values
- Physical Science
- Social and Behavioral Sciences

**University Requirements:**
- American History
- American Institutions
- American Cultures
- Entry Level Writing
- Reading & Composition (R&C A and R&C B)

#### 2.1.5 Units (Range Slider)
- Dual-thumb slider from 0 to 5+.
- Snap points at: 0, 1, 2, 3, 4, 5+
- Labels displayed below the track at each snap point.
- Selecting e.g. 3–4 shows only courses with 3 or 4 units.

#### 2.1.6 Enrollment Status (Multi-select dropdown)
- Options: `Open Seats (Non-Reserved)`, `Open Seats`, `Open Wait List`

#### 2.1.7 Grading Option (Multi-select dropdown)
- Options: `Letter Graded`, `Pass/Not Pass`, `Satisfactory/Unsatisfactory`

#### 2.1.8 Date and Time
- **Day selector:** Row of 7 toggle buttons: `M` `Tu` `W` `Th` `F` `Sa` `Su`
  - Multiple days can be selected simultaneously.
  - Filters to courses that meet on ANY of the selected days.
- **Time range:** Two time pickers — `From` and `To` (24-hour or AM/PM format).
  - Filters to courses whose scheduled time overlaps with the selected range.

---

### 2.2 Center Column — Class List

#### 2.2.1 Search Bar
- Positioned at the top of the class list column.
- Placeholder text: `Search Fall 2026 classes...`
- Searches across: course code (e.g., "ECON 151"), course title (e.g., "Labor Economics"), and description text.
- Real-time filtering as user types (debounced ~300ms).
- Small sparkle/AI icon on the right side of the search input (decorative).
- Below the search bar: display **active filter chips** — small removable pills showing active searches (e.g., `ECON 151`, `PHIL 136`, `ECON C110`). Clicking the `×` on a chip removes that search term.

#### 2.2.2 Class Cards (Scrollable List)
Each card displays:
- **Course code + section number** in bold (e.g., `ECON 151 #01`)
- **Course title** below the code (e.g., `Labor Economics`)
- **Average grade badge** — colored letter grade on the right side of the card:
  - A/A+ = green
  - A- = green
  - B+ = yellow/gold
  - B = yellow
  - B- = orange
  - C+ and below = red
- **Enrollment percentage** — colored text (green if < 50%, orange if 50–80%, red if > 80%):
  - Format: `72% enrolled`
- **Units** — e.g., `4 units`
- **Reserved seating indicator** — icon + `Rsvd` text
- **Stars count** — star icon + number (bookmarks/favorites count)

**Card behavior:**
- Clicking a card selects it (highlighted border/background) and loads its detail in the right panel.
- The currently selected card has a left blue border accent.
- Cards are vertically scrollable; the list can contain hundreds of courses.
- Cards should have subtle hover states.

---

### 2.3 Right Panel — Class Detail

When a class card is selected, the right panel shows comprehensive information.

#### 2.3.1 Header Section
- **Course code + section** — large heading (e.g., `ECON 151 #01`)
- **Course title** below (e.g., `Labor Economics`)
- **Metadata row** (horizontal, spaced):
  - Enrollment: `75% enrolled (64 wl.)` — green/orange/red colored based on percentage; waitlist count in parentheses
  - Average grade: letter grade badge (e.g., `A-`)
  - Units: `4 units`
  - Class number: `# 27622`
  - Reserved seating badge: `🪑 Reserved Seating` — clicking or hovering shows a tooltip/popover explaining which specific seats are reserved (e.g., "10 seats reserved for L&S majors, 5 for EOP students")
- **Bookmark icon** (outline star) and **external link icon** in the top right corner of the panel.

#### 2.3.2 Tab Navigation
Five tabs below the header: `Overview` | `Sections` | `Ratings` (with badge count) | `Grades` | `Enrollment`

The active tab has a bottom border highlight.

---

#### Tab: Overview

| Field | Content |
|-------|---------|
| **Time** | Day/time string, e.g., `TuTh, 3:30 - 4:59 PM` |
| **Location** | Building + room, e.g., `Physics Building 4` — rendered as a clickable blue link |
| **Instructor** | Professor name, e.g., `Wilbur Townsend` |
| **Prerequisites** | Prerequisite course codes, e.g., `100A or 101A, or consent of instructor.` |
| **Description** | Full course description paragraph. Can be multiple sentences. |
| **Final Exam** | e.g., `Written final exam during scheduled final exam period` |
| **User-Submitted Class Requirements** | Community-sourced info with icons: `📋 Attendance Required`, `📹 Lectures Recorded` |
| **Suggest an edit** | Link at bottom: `Look inaccurate? Suggest an edit →` |

---

#### Tab: Sections

A scrollable table showing all discussion/lab sections for this course.

| Column | Example |
|--------|---------|
| **Section Number** | `DIS 101`, `DIS 102`, `LAB 201` |
| **Time** | `MWF 9:00 - 9:59 AM` |
| **Location** | `Evans Hall 60` |
| **Instructor** | `GSI Name` |
| **Enrollment** | `24/30` (enrolled/capacity) — color coded by fill rate |
| **Waitlist** | `3` |
| **Status** | `Open` / `Closed` / `Waitlist` — color coded |

- Rows are clickable (for scheduler integration).
- Table headers are sortable by clicking.

---

#### Tab: Grades

Two sub-views within this tab:

**A) Grade Distribution (Bar Chart)**
- Horizontal bar chart showing grade breakdown for the most recent semester or selected instructor.
- X-axis categories: `A+`, `A`, `A-`, `B+`, `B`, `B-`, `C+`, `C`, `C-`, `D+`, `D`, `D-`, `F`, `P`, `NP`
- Y-axis: percentage or count of students.
- Bars colored by grade tier:
  - A range = blue
  - B range = green
  - C range = yellow
  - D range = orange
  - F = red
  - P/NP = gray

**B) Historical Grade Distribution Table**
- Table with columns: `Semester`, `Instructor`, `Avg GPA`, `A%`, `B%`, `C%`, `D%`, `F%`, `P%`, `NP%`, `Total Enrolled`
- Rows for each semester the course was offered, going back several years.
- Sortable by any column.

**Filter controls above the chart:**
- Dropdown to select specific **instructor** — shows all instructors who have taught this course historically.
- Dropdown to select specific **semester** — e.g., `Fall 2025`, `Spring 2025`, etc.
- Selecting an instructor filters the chart to only that instructor's grade data.
- Selecting a semester filters to that specific term.

---

#### Tab: Enrollment

**Enrollment Over Time (Line Chart)**
- X-axis: `Day 1` through `Day 117` (days since enrollment opened)
- Y-axis: enrollment percentage (0% to 100%)
- Line chart showing how enrollment grew over time — typically an S-curve.
- Toggles above the chart:
  - `Show phases` (toggle on/off) — overlays enrollment phase markers (Phase I, Phase II, Adjustment Period)
  - `Show as student count` (toggle on/off) — switches Y-axis from percentage to raw student count

**Header above chart:**
- Course code with color swatch (e.g., blue square + `ECON 100A`)
- Course title: `Microeconomics`
- Semester + section: `Summer 2026 • Section 1`
- Grade + enrollment: `B+ 86% enrolled 4 units ☆ 59`
- Edit (pencil) and delete (trash) icons on the right.

---

## 3. Scheduler Page (`/scheduler`)

Full-screen schedule builder with left sidebar and right calendar grid.

```
┌──────────────────────┬──────────────────────────────────────────────┐
│  SCHEDULE SIDEBAR    │           WEEKLY CALENDAR GRID               │
│  (~300px)            │           (remaining width)                   │
└──────────────────────┴──────────────────────────────────────────────┘
```

### 3.1 Scheduler Header Bar
- **Top left:** Back arrow + editable schedule name (e.g., `fall26`). Pencil icon to rename. Split-view icon.
- **Top center:** Two tabs: `Schedule` | `Calendar`
- **Top right action buttons:**
  - `✕ Generate` — auto-generate a schedule
  - `⎘ Compare` — compare two schedules
  - `📋 Clone` — duplicate this schedule
  - `↗ Export` — export to .ics or image
  - `Share` (blue pill button with upload icon)
- **Below header:** `Fall 2026` label, `5 classes, 20 units` summary.

### 3.2 Left Sidebar — Added Classes & Events

#### 3.2.1 Add Class Button
- Blue outlined button: `Add class +`
- Clicking opens a search modal/dropdown where the user can search for a course by code or title.
- When a course is found and selected, it is added to the sidebar list and its lecture + discussion blocks appear on the calendar grid.

#### 3.2.2 Add Event Button
- Blue outlined button: `Add event +`
- Clicking opens the **Add Custom Event modal** (see 3.4).

#### 3.2.3 Class Cards in Sidebar
Each added class shows:
- **Course code + section** (bold): e.g., `PHILOS 136 #01`
- **Course title**: e.g., `Philosophy of Perception`
- **Average grade badge** (colored): e.g., `B+`
- **Three-dot menu** (`...`) for options: Remove from schedule, View in catalog
- **Enrollment info**: `42% enrolled 4 units`
- **Expand/collapse arrow** — clicking expands to show available discussion sections.

When expanded:
- List of all available discussion sections with time, location, and enrollment.
- User clicks a section to select it. Selected section appears on the calendar.
- Only one discussion section can be active per course.
- Up/down chevron icon to indicate expand/collapse state.

### 3.3 Right Panel — Weekly Calendar Grid

A standard weekly calendar view:

- **Columns:** `Sunday` | `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday`
- **Rows:** Hourly time slots from `8 AM` to `10 PM`.
- **Time zone label:** `PDT` shown in the header row corner.
- **Current time indicator:** Red line across today's column at the current time, with a small red label showing the exact time (e.g., `10:38 AM`).

#### 3.3.1 Class Blocks on Calendar
- Each class occupies a colored rectangular block spanning the appropriate time range.
- Block shows:
  - Course code in bold (e.g., `PHILOS 136`)
  - Section type (e.g., `Lecture 001`)
  - Location (e.g., `Social Sciences Building 60`)
- **Color coding:** Each course gets a unique color from a palette:
  - Palette: coral/red, green/teal, purple/violet, blue, cyan, orange, pink
  - Lectures and discussions of the same course share the same color.
  - Discussions are slightly different shade or have a border variation.
- Blocks are non-interactive (no drag/resize) but can be clicked to jump to course detail.
- Overlapping classes show side-by-side (split column) or with an overlap indicator.

#### 3.3.2 Custom Event Blocks
- Custom events render identically to class blocks but use a gray color by default (or user-selected color).
- Show event name, time, and optional description.

### 3.4 Add Custom Event Modal

Modal dialog with the following fields:

| Field | Type | Details |
|-------|------|---------|
| **Name** | Text input | Placeholder: `Enter a name` |
| **Time** | Two time pickers | Start time → End time (e.g., `11:30 AM → 03:50 PM`) |
| **Repeat** | Day toggle buttons | Row of 7 buttons: `M` `Tu` `W` `Th` `F` `Sa` `Su` — multi-select |
| **Description** | Text input | Placeholder: `Enter a description` |
| **Color** | Color picker dropdown | Options: Gray (default), Red, Blue, Green, Purple, Orange, Teal, Pink |

- **Add button** (blue pill): `Add →`
- **Close button** (X) in top right corner.
- Modal title: `Add a custom event` with subtitle `Insert a custom event in your schedule`.

---

## 4. Grades Page (`/grades`)

Standalone page for exploring historical grade distributions across any course.

### 4.1 Layout

```
┌──────────────────────┬──────────────────────────────────────────────┐
│  SEARCH SIDEBAR      │           GRADE DISTRIBUTION CHART           │
│  (~300px)            │           + DATA TABLE                        │
└──────────────────────┴──────────────────────────────────────────────┘
```

### 4.2 Left Sidebar — Course Search

- **Search bar** at top: `Search for a class...`
- User types a course code (e.g., `ECON 100A`) and selects from results.
- Once a course is selected, two filter dropdowns appear below:

**Filter 1: Instructor**
- Dropdown listing all instructors who have ever taught this course.
- Selecting an instructor filters the grade chart to only that instructor's sections.
- Option: `All Instructors` (default).

**Filter 2: Semester**
- Dropdown listing all semesters the course was offered: `All Semesters` (default), `Fall 2025`, `Spring 2025`, `Fall 2024`, `Spring 2024`, etc.
- Selecting a semester filters to that specific term.

### 4.3 Right Panel — Grade Visualization

Same chart and table as the Catalog → Class Detail → Grades tab (Section 2.3.2, Tab: Grades), but full-width.

- **Bar chart** of grade distribution (A+ through NP).
- **Historical table** below with semester-by-semester breakdown.
- Both respond to the sidebar filters.

---

## 5. Enrollment Page (`/enrollment`)

Standalone page for tracking enrollment trends over time.

### 5.1 Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  COURSE HEADER (code, title, semester, section, grade, enrollment)   │
├──────────────────────────────────────────────────────────────────────┤
│                    ENROLLMENT LINE CHART                              │
│                    (full width)                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Course Selection

- User searches for a course and semester at the top.
- A search bar or dropdown for course + semester combination.

### 5.3 Course Header Card

Once selected, a card appears showing:
- **Color swatch** (small square, e.g., blue) + **Course code** (bold, e.g., `ECON 100A`)
- **Course title** (e.g., `Microeconomics`)
- **Semester + section** (muted text, e.g., `Summer 2026 • Section 1`)
- **Grade badge** (e.g., `B+`), enrollment (e.g., `86% enrolled`), units (e.g., `4 units`), stars (e.g., `☆ 59`)
- **Edit icon** (pencil) and **delete icon** (trash) on the right — for removing the enrollment view.

### 5.4 Enrollment Chart

Full-width line chart:
- **X-axis:** Days since enrollment opened (`Day 1` to `Day 117` or similar)
- **Y-axis:** Enrollment percentage (0% to 90%+) or student count
- **Line style:** Step-function (staircase) line in blue — enrollment increases in discrete jumps as students enroll.
- **Toggles:**
  - `Show phases` — overlays Phase I / Phase II / Adjustment markers with vertical dashed lines.
  - `Show as student count` — toggles Y-axis from percentage to raw number.
- **Tooltip on hover:** Shows exact enrollment count and date at cursor position.
- **Circular marker** on the chart indicating a notable point (e.g., today's date or phase boundary).

---

## 6. Mock Data Specification

### 6.1 Courses (seed at least 30–50 courses)

Include realistic Berkeley courses across departments. Each course object:

```typescript
interface Course {
  id: string;                    // e.g., "econ-151"
  code: string;                  // e.g., "ECON 151"
  sectionNumber: string;         // e.g., "#01"
  title: string;                 // e.g., "Labor Economics"
  department: string;            // e.g., "Economics"
  units: number;                 // e.g., 4
  classNumber: number;           // e.g., 27622
  level: "lower" | "upper" | "graduate";
  
  // Schedule
  days: string[];                // e.g., ["Tu", "Th"]
  startTime: string;             // e.g., "15:30"
  endTime: string;               // e.g., "16:59"
  location: string;              // e.g., "Physics Building 4"
  
  // Instructor & prereqs
  instructor: string;            // e.g., "Wilbur Townsend"
  prerequisites: string;         // e.g., "100A or 101A, or consent of instructor."
  description: string;           // Full course description
  finalExam: string;             // e.g., "Written final exam during scheduled final exam period"
  
  // Enrollment
  enrolledCount: number;         // e.g., 192
  enrollmentCapacity: number;    // e.g., 256
  waitlistCount: number;         // e.g., 64
  enrollmentPercent: number;     // computed: enrolledCount / enrollmentCapacity * 100
  
  // Grading
  averageGPA: number;            // e.g., 3.503
  averageGrade: string;          // e.g., "A-"
  gradingOption: "letter" | "pnp" | "satisfactory";
  
  // Requirements fulfilled
  requirements: {
    lsBreadth: string[];         // e.g., ["Social and Behavioral Sciences"]
    universityReqs: string[];    // e.g., ["American Cultures"]
  };
  
  // Reserved seating
  hasReservedSeating: boolean;
  reservedSeatingDetails?: string; // e.g., "10 seats for L&S declared majors"
  
  // Community
  starsCount: number;            // e.g., 5
  attendanceRequired: boolean;
  lecturesRecorded: boolean;
  
  // Sections (discussions, labs)
  sections: Section[];
  
  // Historical grade data
  gradeHistory: GradeRecord[];
  
  // Enrollment history
  enrollmentHistory: EnrollmentDataPoint[];
}

interface Section {
  sectionNumber: string;         // e.g., "DIS 101"
  type: "discussion" | "lab";
  days: string[];
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  enrolledCount: number;
  capacity: number;
  waitlistCount: number;
  status: "open" | "closed" | "waitlist";
}

interface GradeRecord {
  semester: string;              // e.g., "Fall 2025"
  instructor: string;
  totalEnrolled: number;
  distribution: {
    aPlus: number;
    a: number;
    aMinus: number;
    bPlus: number;
    b: number;
    bMinus: number;
    cPlus: number;
    c: number;
    cMinus: number;
    dPlus: number;
    d: number;
    dMinus: number;
    f: number;
    p: number;
    np: number;
  };
  averageGPA: number;
}

interface EnrollmentDataPoint {
  day: number;                   // days since enrollment opened
  enrollmentPercent: number;
  enrolledCount: number;
}
```

### 6.2 Sample Courses to Include

At minimum, seed with these real Berkeley courses (populate with realistic data):

| Code | Title | Units | Avg Grade |
|------|-------|-------|-----------|
| ECON 151 | Labor Economics | 4 | A- |
| COMPSCI 189 | Introduction to Machine Learning | 4 | B+ |
| POLSCI 124A | War! | 4 | A- |
| ESPM 50AC | Introduction to Culture and Natural Resource Management | 4 | A |
| ECON 135 | Economic Growth in Historical Perspective | 4 | A |
| PBHLTH 101 | A Sustainable World: Challenges and Opportunities | 3 | A |
| ECON 140 | Econometrics | 4 | B+ |
| PHILOS 136 | Philosophy of Perception | 4 | B+ |
| ECON C110 | Game Theory in the Social Sciences | 4 | B+ |
| PHILOS 107 | Moral Psychology | 4 | B+ |
| STAT C140 | Probability for Data Science | 4 | B+ |
| ECON 100A | Microeconomics | 4 | B+ |
| DATA C100 | Principles & Techniques of Data Science | 4 | B+ |
| COMPSCI 61A | Structure of Computer Programs | 4 | B+ |
| COMPSCI 61B | Data Structures | 4 | B |
| COMPSCI 70 | Discrete Mathematics and Probability Theory | 4 | B |
| MATH 53 | Multivariable Calculus | 4 | B |
| MATH 54 | Linear Algebra & Differential Equations | 4 | B |
| ECON 1 | Introduction to Economics | 4 | B+ |
| PSYCH 1 | Introduction to Psychology | 3 | A- |
| HISTORY 7A | US History to 1877 | 4 | A- |
| PHILOS C158 | Buddhist Philosophy of Mind | 4 | A- |
| ECON 136 | Financial Economics | 4 | B+ |
| DATA 8 | Foundations of Data Science | 4 | A- |
| UGBA 10 | Principles of Business | 3 | A- |
| INTEGBI 35AC | Human Biological Variation | 3 | A |

Include at least 30 courses total. Distribute across departments, levels, and requirement categories.

### 6.3 Enrollment History Data

For each course, generate an array of ~120 data points simulating the enrollment S-curve:
- Days 1–30: near 0% (before enrollment opens)
- Days 30–50: rapid climb from 0% to 30–50%
- Days 50–80: steady growth to 60–70%
- Days 80–100: slower growth to 80–90%
- Days 100–117: final adjustments, plateaus near final enrollment

### 6.4 Grade History Data

For each course, generate 4–8 semesters of historical grade records with different instructors. Vary distributions realistically — harder courses have lower average GPAs, humanities tend higher.

---

## 7. Interaction & UX Specifications

### 7.1 Keyboard & Accessibility
- Search bars auto-focus on page load.
- `Esc` closes modals.
- Tab navigation works through all interactive elements.
- All interactive elements have focus ring styles.

### 7.2 Responsive Behavior
- **Desktop (>1024px):** Full three-column layout on Catalog; full sidebar + calendar on Scheduler.
- **Tablet (768–1024px):** Sidebar collapses to overlay/drawer; two-column Catalog.
- **Mobile (<768px):** Single column; tabs replace columns; calendar scrolls horizontally.

### 7.3 State Management
- Use React Context or Zustand for:
  - Selected course (persists across Catalog and Scheduler).
  - Schedule state (added classes, selected sections, custom events).
  - Filter state on Catalog.
  - Theme (dark/light mode toggle).
- Schedule data persists in `localStorage`.

### 7.4 URL Routing
- `/catalog` — Catalog page, with optional query params for active filters
- `/catalog/:courseId` — Catalog with specific course pre-selected
- `/scheduler` — Scheduler page
- `/grades` — Grades page
- `/grades/:courseId` — Grades with specific course pre-loaded
- `/enrollment` — Enrollment page
- `/enrollment/:courseId` — Enrollment with specific course pre-loaded

### 7.5 Animations & Transitions
- Sidebar filter sections have smooth accordion expand/collapse.
- Tab switching uses a subtle fade transition.
- Class cards have a hover scale-up or shadow increase.
- Calendar blocks appear with a fade-in when courses are added.
- Modal open/close uses a fade + slide-up.
- Chart data transitions smoothly when filters change.

---

## 8. Chart Library Specifications

Use **Recharts** (available in the React artifact environment) for all charts:

### 8.1 Grade Distribution Bar Chart
- `<BarChart>` with `<Bar>` for each grade category.
- Each bar colored by grade tier.
- `<XAxis>` with grade labels. `<YAxis>` with percentage.
- `<Tooltip>` showing exact count and percentage on hover.
- Custom bar shape with rounded top corners.

### 8.2 Enrollment Line Chart
- `<LineChart>` with `<Line type="stepAfter">` for staircase effect.
- `<XAxis>` with day numbers. `<YAxis>` with percentage.
- `<Tooltip>` showing exact enrollment on hover.
- `<ReferenceLine>` components for phase boundaries (if "Show phases" is enabled).
- Smooth animation on initial render.

---

## 9. Component Tree (Recommended)

```
App
├── Navbar
├── CatalogPage
│   ├── FilterSidebar
│   │   ├── SemesterDropdown
│   │   ├── SortByDropdown
│   │   ├── ClassLevelDropdown
│   │   ├── RequirementsDropdown
│   │   ├── UnitsSlider
│   │   ├── EnrollmentStatusDropdown
│   │   ├── GradingOptionDropdown
│   │   └── DateTimeFilter
│   ├── ClassList
│   │   ├── SearchBar
│   │   ├── FilterChips
│   │   └── ClassCard[]
│   └── ClassDetailPanel
│       ├── ClassHeader
│       ├── TabNav
│       ├── OverviewTab
│       ├── SectionsTab
│       ├── RatingsTab
│       ├── GradesTab
│       │   ├── GradeDistributionChart
│       │   └── GradeHistoryTable
│       └── EnrollmentTab
│           └── EnrollmentChart
├── SchedulerPage
│   ├── SchedulerHeader
│   ├── ScheduleSidebar
│   │   ├── AddClassButton → SearchModal
│   │   ├── AddEventButton → EventModal
│   │   └── ScheduledClassCard[]
│   │       └── SectionSelector (expanded)
│   └── WeeklyCalendarGrid
│       ├── TimeColumn
│       ├── DayColumn[] (Sun–Sat)
│       │   ├── ClassBlock[]
│       │   └── EventBlock[]
│       └── CurrentTimeIndicator
├── GradesPage
│   ├── GradesSearchSidebar
│   │   ├── CourseSearch
│   │   ├── InstructorFilter
│   │   └── SemesterFilter
│   └── GradeVisualization
│       ├── GradeDistributionChart
│       └── GradeHistoryTable
└── EnrollmentPage
    ├── CourseSelector
    ├── CourseHeaderCard
    └── EnrollmentChart
```

---

## 10. Non-Functional Requirements

### 10.1 Performance
- Initial page load < 2s.
- Filter changes reflect in < 100ms.
- Charts render within 500ms.
- Class list virtualized for 500+ courses (use `react-window` or similar).

### 10.2 Data Persistence
- Schedule data saved to `localStorage` on every change.
- On reload, schedule is restored from `localStorage`.
- Filter state on Catalog optionally persisted via URL query params.

### 10.3 Browser Support
- Modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions).
- No IE11 support needed.

---

## 11. Out of Scope (for MVP)

- User authentication / Sign In functionality (button exists but is non-functional)
- Gradtrak page (link exists in nav but shows "Coming Soon")
- Ratings tab content (shows placeholder: "No ratings yet")
- Schedule comparison feature
- Schedule auto-generation
- .ics export (button exists but shows toast: "Coming Soon")
- Real API integration (all data is local mock data)
- Mobile native app

---

## 12. File Structure (Recommended)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Redirect to /catalog
│   ├── catalog/
│   │   └── page.tsx
│   ├── scheduler/
│   │   └── page.tsx
│   ├── grades/
│   │   └── page.tsx
│   └── enrollment/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── catalog/
│   │   ├── FilterSidebar.tsx
│   │   ├── ClassList.tsx
│   │   ├── ClassCard.tsx
│   │   ├── ClassDetailPanel.tsx
│   │   ├── OverviewTab.tsx
│   │   ├── SectionsTab.tsx
│   │   ├── GradesTab.tsx
│   │   └── EnrollmentTab.tsx
│   ├── scheduler/
│   │   ├── ScheduleSidebar.tsx
│   │   ├── WeeklyCalendar.tsx
│   │   ├── CalendarBlock.tsx
│   │   ├── AddClassModal.tsx
│   │   └── AddEventModal.tsx
│   ├── grades/
│   │   ├── GradeSearch.tsx
│   │   └── GradeChart.tsx
│   ├── enrollment/
│   │   ├── EnrollmentSearch.tsx
│   │   └── EnrollmentChart.tsx
│   └── ui/
│       ├── Dropdown.tsx
│       ├── Modal.tsx
│       ├── Slider.tsx
│       ├── Toggle.tsx
│       ├── SearchInput.tsx
│       └── Tooltip.tsx
├── data/
│   └── courses.ts                  # All mock course data
├── store/
│   ├── catalogStore.ts             # Filter state
│   ├── scheduleStore.ts            # Schedule state
│   └── themeStore.ts               # Dark/light mode
├── types/
│   └── index.ts                    # TypeScript interfaces
├── utils/
│   ├── gradeUtils.ts               # GPA calculations, grade colors
│   ├── timeUtils.ts                # Time formatting, overlap detection
│   └── filterUtils.ts              # Filter logic
└── styles/
    └── globals.css                 # CSS variables, base styles
```

---

## 13. Development Priorities

### Phase 1: Foundation
1. Project scaffolding (Vite + React + TypeScript + Tailwind)
2. Global layout: Navbar, routing, dark theme
3. Mock data seed file with all courses
4. Type definitions

### Phase 2: Catalog
1. Filter sidebar (all filter types)
2. Class list with search
3. Class detail panel — Overview tab
4. Sections tab
5. Grades tab (chart + table)
6. Enrollment tab (chart)

### Phase 3: Scheduler
1. Weekly calendar grid
2. Sidebar with add class / add event
3. Class search + add to schedule
4. Custom event modal
5. Calendar rendering of class blocks
6. Section selector (expand class → pick discussion)
7. localStorage persistence

### Phase 4: Grades & Enrollment Pages
1. Grades search + visualization
2. Enrollment search + chart
3. Cross-linking between Catalog detail and standalone pages

### Phase 5: Polish
1. Animations and transitions
2. Responsive layouts
3. Edge cases (overlapping classes, empty states, long descriptions)
4. Performance optimization (virtualization)
