// Reads the running programs: "tasklist" on Windows, "ps" on macOS and Linux.
import { execFile } from 'node:child_process';
import { appMatches } from './rules.js';

// Lines like: "chrome.exe","1234","Console","1","120,000 K"
export function parseTasklist(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^"([^"]+)","(\d+)"/.exec(line.trim());
    if (m) out.push({ name: m[1], pid: Number(m[2]) });
  }
  return out;
}

// Lines like: "  812 /Applications/Slack.app/Contents/MacOS/Slack"
export function parsePs(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^\s*(\d+)\s+(.+?)\s*$/.exec(line);
    if (m) out.push({ name: m[2], pid: Number(m[1]) });
  }
  return out;
}

export function listApps() {
  const win = process.platform === 'win32';
  const [cmd, args] = win ? ['tasklist', ['/fo', 'csv', '/nh']] : ['ps', ['-A', '-o', 'pid=,comm=']];
  const opts = { windowsHide: true, timeout: 5000, maxBuffer: 8 * 1024 * 1024 };
  return new Promise((resolve) => {
    execFile(cmd, args, opts, (err, out) => resolve(err ? [] : (win ? parseTasklist : parsePs)(out)));
  });
}

// The running programs to hold back. Never SpiderGuard itself or a protected app.
export function findBlocked(running, apps, self = [process.pid, process.ppid]) {
  return running.filter((p) => p.pid > 0 && !self.includes(p.pid) && appMatches(p.name, apps));
}
