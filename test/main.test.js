// Starts the app and checks that it answers like an abc app should.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './fake-host.js';

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

test('answers initialize, ping and shutdown, then exits', async () => {
  const host = startApp();
  const init = await host.ask('initialize', { mode: 'window', dataDir: host.dataDir });
  assert.deepEqual(init.result, { capabilities: { ui: true } });
  assert.equal((await host.ask('ping')).result, 'pong');
  assert.equal((await host.ask('nope')).error.code, -32601);
  assert.equal((await host.ask('shutdown')).result, null);
  assert.equal(await host.exited, 0);
});

test('runs a session, saves it, and refuses to end a strict one', async () => {
  const host = startApp();
  await host.ask('initialize', { mode: 'tab', dataDir: host.dataDir });
  assert.equal((await host.ask('session.status')).result.phase, 'idle');
  const started = (await host.ask('session.start', { minutes: 25, strict: true })).result;
  assert.equal(started.phase, 'focus');
  assert.equal(started.left, 25 * 60);
  assert.equal(host.storage.get('session').phase, 'focus');
  assert.match((await host.ask('session.stop')).error.message, /Strict/);
  await wait(1200);
  assert.ok(host.notices.some((n) => n.method === 'state' && n.params.phase === 'focus'));
  assert.ok(host.calls.some((c) => c.method === 'host.setBadge' && c.params.text === '25'));
  await host.ask('shutdown');
  await host.exited;
});

test('picks the session up again after a restart', async () => {
  const storage = new Map([['session', { phase: 'focus', round: 1, strict: false, startedAt: Date.now() - 60000, endsAt: Date.now() + 60000 }]]);
  const host = startApp(storage);
  await host.ask('initialize', { mode: 'background', dataDir: host.dataDir });
  const status = (await host.ask('session.status')).result;
  assert.equal(status.phase, 'focus');
  assert.equal(status.round, 1);
  assert.equal((await host.ask('session.stop')).result.phase, 'idle');
  await host.ask('shutdown');
});

test('keeps rules and gives stats', async () => {
  const host = startApp();
  await host.ask('initialize', { mode: 'tab', dataDir: host.dataDir });
  const rules = (await host.ask('rules.set', { rules: ['News', 'example.org', 'Spotify'] })).result;
  assert.deepEqual(rules.rules, ['News', 'example.org', 'Spotify']);
  assert.ok(rules.sites.includes('cnn.com'));
  assert.deepEqual(host.storage.get('rules'), rules.rules);
  assert.equal((await host.ask('stats.get')).result.sessionsToday, 0);
  host.app.stdin.end();
  assert.equal(await host.exited, 0);
});
