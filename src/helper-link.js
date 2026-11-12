// The link between SpiderGuard and its elevated helper: small JSON files
// in the data folder. "want" is what to block, "done" says it was applied,
// and "alive" is a heartbeat the helper writes twice a second.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const ALIVE_MS = 3000;

export const linkFiles = (dataDir) => ({
  want: join(dataDir, 'hosts-want.json'),
  done: join(dataDir, 'hosts-done.json'),
  alive: join(dataDir, 'helper.json')
});

export function readJsonFile(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

// Writes to a temp file first, so the other side never reads half a file.
export function writeJsonFile(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data));
  renameSync(tmp, file);
}

export function helperAlive(dataDir, now = Date.now()) {
  const beat = readJsonFile(linkFiles(dataDir).alive);
  return Boolean(beat && Number.isFinite(beat.at) && now - beat.at < ALIVE_MS);
}

// Waits until the helper applied request "seq", or the time runs out.
export function waitDone(dataDir, seq, timeoutMs) {
  const until = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const check = () => {
      const done = readJsonFile(linkFiles(dataDir).done);
      if (done && done.seq >= seq) return resolve(Boolean(done.ok));
      if (Date.now() > until) return resolve(false);
      setTimeout(check, 200);
    };
    check();
  });
}
