// A tiny stand-in for abc: starts main.js, answers its host.* calls like
// abc does, and lets a test send requests and read notices.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function startApp(storage = new Map()) {
  const env = { ...process.env, SPIDERGUARD_DRY_RUN: '1' };
  const app = spawn(process.execPath, ['main.js'], { env });
  const waiting = new Map();
  const notices = [];
  const calls = [];
  let nextId = 1;

  const write = (msg) => app.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...msg })}\n`);
  const HOST = {
    'host.storage.get': (p) => storage.get(p.key) ?? null,
    'host.storage.set': (p) => { storage.set(p.key, p.value); return true; }
  };

  createInterface({ input: app.stdout }).on('line', (line) => {
    const msg = JSON.parse(line);
    if (msg.method && msg.id !== undefined) {
      calls.push(msg);
      const fn = HOST[msg.method];
      return write({ id: msg.id, result: fn ? fn(msg.params) : true });
    }
    if (msg.method) return notices.push(msg);
    const done = waiting.get(msg.id);
    if (done) done(msg);
    return undefined;
  });

  const ask = (method, params = {}) => new Promise((resolve) => {
    const id = nextId++;
    waiting.set(id, resolve);
    write({ id, method, params });
  });

  const dataDir = mkdtempSync(join(tmpdir(), 'spiderguard-'));
  const exited = new Promise((resolve) => app.once('exit', resolve));
  return { app, ask, notices, calls, storage, dataDir, exited };
}
