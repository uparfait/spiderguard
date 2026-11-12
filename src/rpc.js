// JSON-RPC 2.0 with abc, one message per line on stdin and stdout.
// abc sends us requests, and we send abc requests too (host.*), so
// replies are matched to our own requests by id.
import { createInterface } from 'node:readline';

const pending = new Map();
let nextId = 1;

// A closed pipe must never crash the app while it cleans up.
process.stdout.on('error', () => {});

export function send(body) {
  if (process.stdout.writable) process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...body })}\n`);
}

// A message with no reply, like the "state" notice for the page.
export const notify = (method, params) => send({ method, params });

// Asks abc something and waits for the answer.
export function request(method, params, timeoutMs = 10000) {
  const id = `sg-${nextId++}`;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} got no answer`)); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    send({ id, method, params });
  });
}

function settle(msg) {
  const wait = pending.get(msg.id);
  if (!wait) return;
  clearTimeout(wait.timer);
  pending.delete(msg.id);
  if (msg.error) wait.reject(new Error(msg.error.message || 'abc error'));
  else wait.resolve(msg.result);
}

async function answer(msg, methods) {
  const fn = Object.hasOwn(methods, msg.method) ? methods[msg.method] : null;
  if (!fn) return send({ id: msg.id, error: { code: -32601, message: 'method not found' } });
  try { send({ id: msg.id, result: (await fn(msg.params || {})) ?? null }); }
  catch (err) { send({ id: msg.id, error: { code: -32000, message: err.message } }); }
}

// Reads abc messages until stdin closes, then calls onClose.
export function serve(methods, onClose) {
  createInterface({ input: process.stdin })
    .on('line', (line) => {
      let msg;
      try { msg = JSON.parse(line); } catch { return; }
      if (!msg || typeof msg !== 'object') return;
      if (!msg.method) return settle(msg);
      // Notices from abc ("initialized", "mode.changed") need no answer.
      if (msg.id !== undefined) answer(msg, methods);
    })
    .on('close', onClose);
}
