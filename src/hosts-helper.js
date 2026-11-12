// The small elevated helper. elevate.js starts it once with admin rights.
// It applies the site list SpiderGuard asks for, and when SpiderGuard stops
// (or crashes) it removes the block and exits.
// Usage: node hosts-helper.js <dataDir> <parentPid>
import { writeSites } from './hosts-file.js';
import { cleanSites } from './hosts.js';
import { linkFiles, readJsonFile, writeJsonFile } from './helper-link.js';

const [dataDir, parentPid] = process.argv.slice(2);
let applied = null;

function parentAlive() {
  try {
    process.kill(Number(parentPid), 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function finish() {
  try { writeSites([]); } catch (err) { console.error(err.message); }
  process.exit(0);
}

function tick() {
  if (!dataDir || !Number(parentPid) || !parentAlive()) return finish();
  const files = linkFiles(dataDir);
  writeJsonFile(files.alive, { pid: process.pid, at: Date.now() });
  const want = readJsonFile(files.want);
  if (!want || want.seq === applied) return;
  applied = want.seq;
  try {
    // Only clean domain names, pointed at 0.0.0.0, ever reach the file.
    writeSites(cleanSites(want.sites));
    writeJsonFile(files.done, { seq: want.seq, ok: true });
  } catch (err) {
    writeJsonFile(files.done, { seq: want.seq, ok: false, error: err.message });
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, finish);
setInterval(tick, 500);
tick();
