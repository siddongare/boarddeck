<p align="left">
  <img src="assets/logo.svg" alt="HSC CS logo" width="44" height="44" />
</p>

# HSC CS (Class 12 CS1 & CS2)

**[hsc-cs.vercel.app](https://hsc-cs.vercel.app)**

I built this because I have JEE in January and Maharashtra HSC boards in February, and digging through 24 separate board PDFs was wasting too much time.

Every question from the 2015–2026 HSC Computer Science Paper I and Paper II board exams (963 questions across 24 papers) is sorted here by syllabus chapter and paper format, with answers hidden by default so you actually test yourself instead of passively reading solutions.

## Screenshots

| Overview & Skip Matrix | Chapter Active Recall |
| --- | --- |
| ![Overview](assets/overview.png) | ![Chapter Drill](assets/chapter-drill.png) |

## What it does

- **Chapter-wise & paper-format order:** Each chapter starts with MCQs (1M), then 1–2M short answers, 3M theory/diagrams, 4M algorithms, and ends with 5M C++, HTML, and 8085 Assembly coding questions.
- **Repeat frequency flags:** Clusters near-identical questions and concept variants across years (`Asked 4×`, etc.) so you can filter down to high-yield repeats first.
- **Interactive MCQs + hidden answers:** Click an option (`1`–`4`) to check it immediately, or hit `R` to reveal the answer for theory and code questions.
- **Mock full papers:** Pick any of the 24 papers (`2015 March` – `2026 March`) in original `Q.1` to `Q.5` order with a 3-hour timer. Mock mode stays isolated from your chapter progress so MCQs and answers start blank.
- **Own notes & photos:** Add your own concise board-style text answer or attach a photo of your handwritten notes on any question. Everything saves locally in `localStorage` with JSON Backup/Restore.
- **2011–2014 archive:** Direct links to the 7 older papers that are only available as scanned images.

## Keyboard shortcuts

- `J` / `K` — next / previous question
- `1`–`4` — pick MCQ option
- `R` — reveal / hide answer
- `M` — mark mastered
- `F` — flag for review queue

## Notes on the data

- Questions, diagrams, and reference explanations were collected from [Shaalaa](https://www.shaalaa.com/course/maharashtra-board-12th-standard-board-exam-hsc-science-computer-science_585).
- Some older Shaalaa solutions are longer than what HSC examiners expect or omit marks-specific formatting. Use the `+ My Answer / Photo` button on those cards to keep your own crisp points.
- 14 of the 963 questions have blank solution text on Shaalaa and link directly to the source page.

## Run locally

It is a single static `index.html` file with no build step:

```bash
git clone https://github.com/siddongare/hsc-cs.git
cd hsc-cs
# open index.html in any browser
```

## License

MIT for the web app shell ([LICENSE](LICENSE)). Question papers belong to MSBSHSE and reference explanations belong to their respective authors on Shaalaa.
