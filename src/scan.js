// Reads every running program, as { pid, name, alt }. "alt" is a second
// name to match: the description on Windows ("Character Map" for
// charmap.exe), the app bundle on macOS ("Google Chrome"), and the full
// command on Linux (where the short name is cut to 15 characters).
import { execFile } from 'node:child_process';
import { parseTasklist, parsePs, parsePsArgs } from './apps.js';
import { ask } from './win-shell.js';

const OPTS = { windowsHide: true, timeout: 8000, maxBuffer: 16 * 1024 * 1024 };

function run(cmd, args, parse) {
  return new Promise((resolve) => {
    execFile(cmd, args, OPTS, (err, out) => resolve(err ? [] : parse(out)));
  });
}

// Windows: the open PowerShell gives names and descriptions. If it fails,
// "tasklist" still gives the names.
async function listWindows() {
  const all = await ask('list');
  if (!Array.isArray(all)) return run('tasklist', ['/fo', 'csv', '/nh'], parseTasklist);
  return all.filter((p) => p && Number.isInteger(p.Id) && p.ProcessName)
    .map((p) => ({ pid: p.Id, name: p.ProcessName, alt: p.Description || undefined }));
}

export function listApps() {
  if (process.platform === 'win32') return listWindows();
  if (process.platform === 'darwin') return run('ps', ['-A', '-o', 'pid=,comm='], parsePs);
  return run('ps', ['-A', '-o', 'pid=,comm=,args='], parsePsArgs);
}
