// What happens to a blocked app: gentle mode minimizes it, strict mode closes it.
import { spawn, execFile } from 'node:child_process';

// On Windows one PowerShell stays open and minimizes windows by process id,
// so a scan every 2 seconds does not start a new PowerShell each time.
const WIN_SCRIPT = [
  '$s = \'[DllImport("user32.dll")] public static extern bool ShowWindowAsync(System.IntPtr h, int n);\'',
  '$w = Add-Type -MemberDefinition $s -Name Win -Namespace SpiderGuard -PassThru',
  'while (($line = [Console]::In.ReadLine()) -ne $null) {',
  '  $ids = $line -split \',\' | ForEach-Object { [int]$_ }',
  '  Get-Process -Id $ids -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } |',
  '    ForEach-Object { [void]$w::ShowWindowAsync($_.MainWindowHandle, 6) }',
  '}'
].join('\n');

let shell = null;
function windowsMinimize(pids) {
  if (!shell || shell.exitCode !== null) {
    shell = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', WIN_SCRIPT],
      { stdio: ['pipe', 'ignore', 'ignore'], windowsHide: true });
    shell.on('error', () => { shell = null; });
    shell.stdin.on('error', () => {});
  }
  shell.stdin.write(`${pids.join(',')}\n`);
}

const quietRun = (cmd, args) => execFile(cmd, args, { windowsHide: true, timeout: 5000 }, () => {});

export function minimizeApps(pids) {
  const ids = pids.filter(Number.isInteger);
  if (!ids.length) return;
  if (process.platform === 'win32') return windowsMinimize(ids);
  for (const pid of ids) {
    if (process.platform === 'darwin') {
      quietRun('osascript', ['-e', `tell application "System Events" to set visible of (every process whose unix id is ${pid}) to false`]);
    } else quietRun('xdotool', ['search', '--pid', String(pid), 'windowminimize', '%@']);
  }
}

export function closeApps(pids) {
  for (const pid of pids.filter(Number.isInteger)) {
    try { process.kill(pid); } catch { /* already gone, or not ours to close */ }
  }
}

// Ends the PowerShell helper when SpiderGuard stops.
export function stopActions() {
  if (shell && shell.exitCode === null) shell.kill();
  shell = null;
}
