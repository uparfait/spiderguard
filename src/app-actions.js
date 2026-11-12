// What happens to a blocked app: gentle mode minimizes it, strict mode closes it.
import { execFile } from 'node:child_process';
import { ask, stopShell } from './win-shell.js';

const quietRun = (cmd, args) => execFile(cmd, args, { windowsHide: true, timeout: 10000 }, () => {});

// Gives how many windows were minimized on Windows (null elsewhere).
export async function minimizeApps(pids) {
  const ids = pids.filter(Number.isInteger);
  if (!ids.length) return 0;
  if (process.platform === 'win32') return ask(`min ${ids.join(',')}`);
  for (const pid of ids) {
    if (process.platform === 'darwin') {
      quietRun('osascript', ['-e', `tell application "System Events" to set visible of (every process whose unix id is ${pid}) to false`]);
    } else quietRun('xdotool', ['search', '--pid', String(pid), 'windowminimize', '%@']);
  }
  return null;
}

// Closes every matched process. On Windows one "taskkill /F" call ends them
// all; child programs that are not blocked themselves (like a terminal
// opened from an editor) are left alone, so there is no "/T".
export function closeApps(pids) {
  const ids = pids.filter(Number.isInteger);
  if (!ids.length) return;
  if (process.platform === 'win32') {
    quietRun('taskkill', ['/F', ...ids.flatMap((id) => ['/PID', String(id)])]);
    return;
  }
  for (const pid of ids) {
    try { process.kill(pid, 'SIGTERM'); } catch { /* already gone, or not ours to close */ }
  }
}

// Ends the PowerShell helper when SpiderGuard stops.
export const stopActions = stopShell;
