# BoardDeck — HSC Class 12 PYQ & Mock Exam Workspace

**Live app:** [boardeck.vercel.app](https://boardeck.vercel.app)

BoardDeck is a static revision workspace built for Maharashtra State Board (MSBSHSE) Class 12 Science students. Compulsory Science papers (`Physics`, `Chemistry`, `Mathematics`, `English`) and Bifocal electives (`Computer Science D-9`, `Electronics C-2`) stay strictly isolated with their own chapter trees, weightage tables, past papers, review queues, and timed mock exams.

## Covered Subjects (2,866 Questions · 1,034 Repeat Flags)

| Group | Subject | Code | Coverage | Count |
| --- | --- | --- | --- | --- |
| Core | Physics | `54` | 2022–2026 Revised Syllabus · 8 papers | 442 Qs |
| Core | Chemistry | `55` | 2022–2026 Revised Syllabus · 8 papers | 581 Qs |
| Core | Mathematics & Statistics | `40` | 2022–2026 Revised Syllabus · 8 papers | 357 Qs |
| Core | English | `01` | Prose, Poetry, Writing Skills (`Q.4`), Novel | 267 Qs |
| Bifocal | Computer Science | `D-9` | 2015–2026 structured + scan links | 963 Qs |
| Bifocal | Electronics | `C-2` | Applied & Digital Electronics · SVG circuits | 256 Qs |

Datasets lazy-load on demand per subject from `data/<stream>.json`, while `data/manifest.json` powers fast boot and isolated progress metrics on the landing screen.

## Previews

| Home & Subject Switcher | Overview & Slot Strategy | Chapter Drill (`\ce{}` & Solutions) |
| --- | --- | --- |
| ![Home](assets/home.png) | ![Overview](assets/overview.png) | ![Chapter Drill](assets/chapter-drill.png) |

## Key Features

- **Hidden answers by default:** Attempt MCQs first for immediate verification or press `R` to reveal full step-by-step solutions.
- **Formula & code isolation:** MathJax 3 (`input/tex` + `input/asciimath` + `mhchem`) formats vectors, integrals, and chemical equations cleanly while ignoring HTML, C++, and 8085 Assembly code blocks.
- **Paper-slot strategy:** Maps chapter marks and exam shortcuts (such as CS1 `Q.5` HTML vs C++ pairing and English `Q.4` writing templates).
- **Timed mock exams:** Sorts each past paper in original paper order with a 3-hour countdown and separate mock state.
- **Keyboard navigation:** `J` / `K` move across cards, `1–4` answer MCQs, `R` toggles answers, `M` marks mastered, `F` queues review, and `Ctrl+K` opens quick chapter jump.
- **Cloud Sync + Offline Guest mode:** Persists locally in `localStorage` out of the box and syncs across devices via Supabase Auth + Postgres Row Level Security.

## Cloud Sync & Vercel Setup

1. In Supabase, open **SQL Editor** and run [`supabase_schema.sql`](supabase_schema.sql) to create the `boarddeck_profiles` table and Row Level Security policies.
2. In Supabase -> **Authentication -> URL Configuration**, add `https://boardeck.vercel.app/**` to **Redirect URLs** and set **Site URL** to `https://boardeck.vercel.app`.
3. Link Supabase to Vercel via **Supabase -> Settings -> Integrations -> Vercel -> Add new project connection** (or set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables). During build, [`scripts/inject-env.mjs`](scripts/inject-env.mjs) writes those public config values into `assets/supa-env.js` automatically.

## Running Locally

Because `data/*.json` files load over `fetch()`, run a local static server from the repo root:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Repository Structure

```text
.
├── assets/
│   ├── app.js           # Client state, lazy JSON loader, filters, mock engine, sync hooks
│   ├── styles.css         # Dark/light theme tokens, layout grids, responsive drawer, motion
│   ├── supa-env.js        # Public Supabase endpoint stub (updated on Vercel build)
│   └── sync.js            # Supabase Auth, timestamped merge, debounced cloud push
├── data/
│   ├── manifest.json      # Lightweight index across all 6 streams
│   └── *.json             # Isolated subject datasets (phy, chem, math, eng, cs, el)
├── scripts/
│   └── inject-env.mjs     # Vercel build script writing public env vars to assets/supa-env.js
├── index.html             # Application shell & MathJax 3 configuration
├── supabase_schema.sql    # Postgres schema, RLS policies & updated_at trigger
└── vercel.json            # Static routing, clean URLs & build hook
```
