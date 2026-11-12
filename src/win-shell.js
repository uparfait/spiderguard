// One PowerShell that stays open for the session on Windows. SpiderGuard
// sends it one command per line and reads one JSON line back, so the scan
// every 2 seconds does not start a new program each time.
//   list        -> [{ Id, ProcessName, Description }] for every process
//   min 1,2,3   -> how many windows were minimized
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { NATIVE } from './win-native.js';

const SCRIPT = `[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -TypeDefinition @'\n${NATIVE}\n'@
while (($line = [Console]::In.ReadLine()) -ne $null) {
  try {
    if ($line -eq 'list') {
      $all = @(Get-Process | Select-Object Id, ProcessName, Description)
      [Console]::Out.WriteLine((ConvertTo-Json -InputObject $all -Compress))
    } elseif ($line.StartsWith('min ')) {
      [Console]::Out.WriteLine([SGWin]::Minimize([uint32[]]($line.Substring(4) -split ',')))
    } else { [Console]::Out.WriteLine('null') }
  } catch { [Console]::Out.WriteLine('null') }
}`;

let shell = null;
let waiting = [];

// Ends the shell. Every waiting command gets null.
export function stopShell() {
  const pending = waiting;
  waiting = [];
  if (shell && shell.exitCode === null) shell.kill();
  shell = null;
  pending.forEach((answer) => answer('null'));
}

function open() {
  const encoded = Buffer.from(SCRIPT, 'utf16le').toString('base64');
  shell = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
    { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
  shell.stdout.setEncoding('utf8');
  createInterface({ input: shell.stdout }).on('line', (line) => { const next = waiting.shift(); if (next) next(line); });
  shell.on('exit', stopShell);
  shell.on('error', stopShell);
  shell.stdin.on('error', () => {});
}

// Answers come in order. A command with no answer in time restarts the
// shell, so later answers never get mixed up.
export function ask(command, timeoutMs = 15000) {
  if (!shell) open();
  return new Promise((resolve) => {
    const timer = setTimeout(stopShell, timeoutMs);
    waiting.push((line) => {
      clearTimeout(timer);
      try { resolve(JSON.parse(line)); } catch { resolve(null); }
    });
    shell.stdin.write(`${command}\n`);
  });
}
