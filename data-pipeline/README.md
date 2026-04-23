# Data Pipeline

Node scripts that scrape Berkeley course data and produce the JSON files shipped in `public/data/`.

All scripts query [berkeleytime.com](https://berkeleytime.com)'s public GraphQL API. No auth required.

## Scripts

| Script | Output | Purpose |
|---|---|---|
| `main.ts` | `output/courses.json` → `public/data/courses.json` | Fall 2026 rich catalog: instructors, schedule, location, RMP, grades, enrollment history |
| `fetch-all-courses.ts` | `output/all-courses.json` | All 12,661 unique courses across Fall 2020 → Fall 2026. With retries + proper pagination |
| `fetch-breadths.ts` | `output/course-breadths.json` | Maps course code → breadth tags (Arts & Lit, Bio Sci, etc.) — 1,750 courses |
| `fetch-uni-reqs.ts` | `output/course-uni-reqs.json` | Maps course code → university-req tags (American Cultures, ELW, etc.) — 286 courses |
| `fetch-prereqs.ts` | `output/course-prereqs.json` | Maps course code → prereq codes + raw text — 5,973 courses |
| `merge-breadths.ts` | merges breadths + uni-reqs into `public/data/all-courses.json` and rewrites the L&S program with breadth-rule requirements |
| `enrich-course-terms.ts` | enriches sparse-term courses with full historical offerings via per-course query |
| `btll-import.ts` | rewrites major requirements in `public/data/programs.json` from BtLL reference reqs (`/tmp/btll-ref.ts`) |
| `add-rmp.ts` | enriches `public/data/courses.json` with Rate My Professor ratings for each instructor |
| `refresh-enrollment.ts` | refreshes "current enrollment" snapshot for Fall 2026 |
| `refresh-enrollment-history.ts` | pulls full daily enrollment history with phase markers |
| `fetch-all-history.ts` | multi-semester historical pull (deeper than main.ts) |

## Order to run from scratch

```bash
# 1. Scrape Fall 2026 rich catalog (slow — many GraphQL calls)
npx tsx src/main.ts

# 2. Scrape all-time course list
npx tsx src/fetch-all-courses.ts

# 3. Augment with breadths + uni-reqs + prereqs
npx tsx src/fetch-breadths.ts
npx tsx src/fetch-uni-reqs.ts
npx tsx src/fetch-prereqs.ts

# 4. Merge breadths into all-courses + rewrite L&S program
npx tsx src/merge-breadths.ts

# 5. Apply BtLL major reqs (requires /tmp/btll-ref.ts from
#    https://github.com/asuc-octo/berkeleytime/blob/main/packages/BtLL/reference_gradtrak_reqs.ts)
npx tsx src/btll-import.ts

# 6. Copy outputs to public/data/
cp output/all-courses.json ../public/data/
cp output/courses.json ../public/data/
```

## Layout

```
src/
├── main.ts                          # Fall 2026 rich catalog scraper
├── fetch-all-courses.ts             # All-time course list
├── fetch-all-history.ts             # Multi-term history
├── fetch-breadths.ts                # Breadth tags
├── fetch-uni-reqs.ts                # University req tags
├── fetch-prereqs.ts                 # Prerequisites
├── enrich-course-terms.ts           # Sparse term enrichment
├── merge-breadths.ts                # Merge into shipped JSON
├── btll-import.ts                   # BtLL → programs.json
├── add-rmp.ts                       # RMP enrichment
├── refresh-enrollment.ts            # Current enrollment refresh
├── refresh-enrollment-history.ts    # Daily history pull
├── config.ts                        # Default term, rate limits
├── types.ts                         # Shared types
├── lib/
│   └── graphql-client.ts            # gqlQuery helper with rate limiting
└── pullers/                         # GraphQL query helpers
output/                              # Generated JSON (gitignored)
```

## Config

`config.ts` controls:
- `BT_GRAPHQL_URL` — berkeleytime endpoint (default: `https://berkeleytime.com/api/graphql`)
- `RATE_LIMIT_MS` — sleep between requests (default: 100ms)
- `DEFAULT_YEAR` / `DEFAULT_SEMESTER` — for Fall 2026

## Notes

- berkeleytime's catalogSearch caps at 100 results per page. We use pageSize 50 with retries.
- Each script saves intermediate output every batch — safe to interrupt.
- Total dataset is ~120 MB shipped (mostly Fall 2026 grade+enrollment history).
