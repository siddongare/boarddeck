import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!Array.isArray(manifest.streams) || manifest.streams.length === 0) {
  throw new Error('data/manifest.json: streams must be a non-empty array');
}

const globalUids = new Set();
let totalQuestions = 0;

for (const stream of manifest.streams) {
  const dataFile = path.join(root, stream.dataUrl);
  if (!fs.existsSync(dataFile)) {
    throw new Error(`Missing dataset file: ${stream.dataUrl}`);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const sectionIds = new Set((data.sections || []).map((s) => s[0]));
  if (sectionIds.size === 0) {
    throw new Error(`${stream.dataUrl}: sections array is empty`);
  }

  let streamCount = 0;
  let streamMcqCount = 0;

  for (const [subjId, subj] of Object.entries(data.subjects || {})) {
    const chapterIds = new Set((subj.meta || []).map((c) => c.id));
    if (chapterIds.size === 0) {
      throw new Error(`${stream.dataUrl} (${subjId}): meta chapters array is empty`);
    }

    for (const q of subj.questions || []) {
      streamCount++;
      totalQuestions++;

      if (!q.uid || typeof q.uid !== 'string') {
        throw new Error(`${stream.dataUrl} (${subjId}): question missing string uid`);
      }
      if (globalUids.has(q.uid)) {
        throw new Error(`Duplicate question uid across datasets: ${q.uid}`);
      }
      globalUids.add(q.uid);

      if (!q.year || typeof q.year !== 'string') {
        throw new Error(`${q.uid}: missing year`);
      }
      if (typeof q.marks !== 'number' || Number.isNaN(q.marks)) {
        throw new Error(`${q.uid}: marks must be a number`);
      }
      if (!chapterIds.has(q.chapter_id)) {
        throw new Error(`${q.uid}: invalid chapter_id "${q.chapter_id}"`);
      }
      if (!sectionIds.has(q.section_id)) {
        throw new Error(`${q.uid}: invalid section_id "${q.section_id}"`);
      }
      if (!q.prompt_text && !q.prompt_html) {
        throw new Error(`${q.uid}: missing prompt_text and prompt_html`);
      }

      if (q.is_mcq) {
        streamMcqCount++;
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`${q.uid}: MCQ must have at least 2 options`);
        }
        if (
          typeof q.correct_idx !== 'number' ||
          q.correct_idx < 0 ||
          q.correct_idx >= q.options.length
        ) {
          throw new Error(`${q.uid}: invalid correct_idx ${q.correct_idx}`);
        }
      }
    }
  }

  if (streamCount !== stream.questionCount) {
    throw new Error(
      `${stream.id}: manifest questionCount (${stream.questionCount}) !== actual (${streamCount})`
    );
  }
  if (streamMcqCount !== stream.mcqCount) {
    throw new Error(
      `${stream.id}: manifest mcqCount (${stream.mcqCount}) !== actual (${streamMcqCount})`
    );
  }
}

console.log(
  `Validated ${manifest.streams.length} streams and ${totalQuestions} questions (0 duplicates, 0 schema errors).`
);
