// Session history in dataDir/history.json: one JSON line per finished
// session, { start, minutes, kind }. Nothing leaves the computer.
import { appendFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const KINDS = ['focus', 'early'];
const file = (dataDir) => join(dataDir, 'history.json');

export function addHistory(dataDir, entry) {
  if (!KINDS.includes(entry.kind) || !(entry.minutes > 0)) return;
  const line = { start: Math.round(entry.start), minutes: Math.round(entry.minutes * 10) / 10, kind: entry.kind };
  mkdirSync(dataDir, { recursive: true });
  appendFileSync(file(dataDir), `${JSON.stringify(line)}\n`);
}

// Bad lines (a crash mid-write) are skipped, never fatal.
export function readHistory(dataDir) {
  let text = '';
  try { text = readFileSync(file(dataDir), 'utf8'); } catch { return []; }
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    try {
      const e = JSON.parse(line);
      if (e && Number.isFinite(e.start) && Number.isFinite(e.minutes) && KINDS.includes(e.kind)) out.push(e);
    } catch { /* skip */ }
  }
  return out;
}
