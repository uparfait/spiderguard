// Reading process lists, and picking the processes to hold back.
// Each process is { pid, name, alt }; see scan.js for what "alt" is.
import { appMatches } from './rules.js';
import { isProtected } from './protected.js';

// Lines like: "chrome.exe","1234","Console","1","120,000 K"
export function parseTasklist(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^"([^"]+)","(\d+)"/.exec(line.trim());
    if (m) out.push({ name: m[1], pid: Number(m[2]) });
  }
  return out;
}

// macOS lines like: "  812 /Applications/Slack.app/Contents/MacOS/Slack".
// The app bundle ("Slack", "Google Chrome") is the second name.
export function parsePs(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^\s*(\d+)\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const bundle = /([^/]+)\.app\//.exec(m[2]);
    out.push({ name: m[2], pid: Number(m[1]), ...(bundle ? { alt: bundle[1] } : {}) });
  }
  return out;
}

// Linux lines like: " 812 telegram-deskto /opt/telegram/telegram-desktop --x"
export function parsePsArgs(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^\s*(\d+)\s+(\S+)\s*(\S*)/.exec(line);
    if (m) out.push({ name: m[2], alt: m[3] || undefined, pid: Number(m[1]) });
  }
  return out;
}

// The processes to hold back. Never SpiderGuard itself, and never a
// protected program, even when its description matches a rule.
export function findBlocked(running, apps, self = [process.pid, process.ppid]) {
  return running.filter((p) => p.pid > 0 && !self.includes(p.pid) && !isProtected(p.name)
    && [p.name, p.alt].some((n) => n && appMatches(n, apps)));
}
