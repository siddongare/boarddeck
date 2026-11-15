# BoardDeck — HSC Class 12 PYQ & Mock Exam Workspace

BoardDeck is a static workspace for preparing Maharashtra State Board (MSBSHSE) Class 12 exams across the compulsory Science streams and bifocal electives. Each subject stays isolated with its own chapter index, slot strategy, past papers, review queue, and mock exam timer.

## What's Inside

- **Compulsory Core (2022–2026 Revised Syllabus · 8 Official Papers each)**
  - **Physics (`54`):** 442 questions across 16 units (70M theory pattern)
  - **Chemistry (`55`):** 581 questions across 16 units (70M theory + `\ce{}` chemical equations and structure MCQs)
  - **Mathematics & Statistics (`40`):** 357 questions across 15 chapters (Part I & II, 80M pattern, AsciiMath + theorem drills)
  - **English (`01`):** 267 questions mapped into Prose, Poetry & Appreciation templates, Writing Skills (`Q.4` A–D), and Novel (`4.1–4.4`, 80M pattern)
- **Bifocal Electives (200-Mark Streams)**
  - **Computer Science (`D-9`):** 963 PYQs across CS1 & CS2 (2015–2026 official + pre-2015 scan links)
  - **Electronics (`C-2`):** 256 PYQs across Applied & Digital Electronics with circuit SVG diagrams and Boolean overlines

Total dataset: **2,866 chapter-mapped questions** with **1,034 repeat flags** across **6 subjects**. Datasets lazy-load per subject from `data/<stream>.json` so the landing page loads fast and only fetches what you open.

## Screenshots

| Home & Subject Switcher | Overview & Slot Strategy | Chapter Drill (`\ce{}` & Solutions) |
| --- | --- | --- |
| ![Home](assets/home.png) | ![Overview](assets/overview.png) | ![Chapter Drill](assets/chapter-drill.png) |

## Features

- **Hidden answers by default:** Attempt MCQs first to see instant right/wrong verification, or press `R` to reveal solutions on theory/numerical questions.
- **MathJax & code isolation:** Renders AsciiMath vectors, matrices, integrals, and LaTeX `mhchem` formulas in Physics, Chemistry, and Maths while leaving HTML, C++, and 8085 Assembly code untouched.
- **Paper-slot strategy:** Shows chapter weightage alongside high-ROI exam shortcuts (e.g., CS1 `Q.5` HTML vs C++ pairing, English `Q.4` template selection).
- **Isolated mock papers:** Sorted in paper order (`Q.1` through the last long answer) with a 3-hour countdown timer and separate mock state so practice history doesn't spoil your simulation.
- **Keyboard shortcuts:** `J` / `K` move between questions, `1–4` answer MCQs, `R` reveals solutions, `M` marks mastered, `F` sends to review, and `Ctrl+K` opens quick jump.
- **Cloud Sync + Offline Guest fallback:** Works out of the box via `localStorage`, or connects to Supabase Auth + Postgres for cross-device sync.

## Running Locally

Because `data/*.json` files are loaded over `fetch()`, serve the folder using any static HTTP server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Optional Cloud Sync Setup (Supabase)

1. Create a free project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** and execute the contents of [`supabase_schema.sql`](supabase_schema.sql). This creates the `boarddeck_profiles` table with Row Level Security so users only read and write their own progress row.
3. Click **Cloud Sync** in the top bar (or sidebar), expand **Supabase Project Connection**, and paste your **Project URL** and **Anon Public Key** (or hardcode them in `assets/sync.js` if hosting for friends).
4. Sign in with Email + Password or Magic Link. Cloud and local progress merge automatically without overwriting mastered questions.

## File Layout

- `index.html` — Lean shell, MathJax 3 startup config, and modal containers
- `assets/styles.css` — Dark/light theme tokens, layout grids, responsive drawer, and motion timing
- `assets/app.js` — Lazy stream loader, filters, mock paper engine, keyboard navigation, and sync wiring
- `assets/sync.js` — Optional Supabase client, merge logic, and offline guest fallback
- `data/*.json` — Lightweight `manifest.json` + isolated per-subject datasets (`phy`, `chem`, `math`, `eng`, `cs`, `el`)
- `supabase_schema.sql` — Postgres table, trigger, and RLS policies for Cloud Sync
