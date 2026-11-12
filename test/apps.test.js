// Process scan parsing and the app guard, with fake process lists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTasklist, parsePs, parsePsArgs, findBlocked } from '../src/apps.js';
import { createAppGuard } from '../src/guard.js';

const TASKLIST = '"explorer.exe","4100","Console","1","90,000 K"\r\n"Discord.exe","5200","Console","1","1 K"\r\n';
const PS = '    1 /sbin/launchd\n  812 /Applications/Slack.app/Contents/MacOS/Slack\n';

test('tasklist and ps output are read', () => {
  assert.deepEqual(parseTasklist(TASKLIST), [{ name: 'explorer.exe', pid: 4100 }, { name: 'Discord.exe', pid: 5200 }]);
  assert.deepEqual(parsePs(PS)[1], { name: '/Applications/Slack.app/Contents/MacOS/Slack', pid: 812, alt: 'Slack' });
});

test('an app matches by its description or bundle name, but protection wins', () => {
  const running = [{ pid: 9, name: 'charmap', alt: 'Character Map' }, { pid: 4, name: 'explorer', alt: 'Character Map' },
    ...parsePs('  812 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome\n')];
  assert.equal(running[2].alt, 'Google Chrome');
  assert.deepEqual(findBlocked(running, ['charactermap', 'googlechrome'], []).map((p) => p.pid), [9, 812]);
});

test('on Linux a name cut to 15 characters still matches by its command', () => {
  const running = parsePsArgs('  77 telegram-deskto /opt/telegram/telegram-desktop -- %u\n');
  assert.deepEqual(findBlocked(running, ['telegramdesktop'], []).map((p) => p.pid), [77]);
});

test('protected apps and SpiderGuard itself are never matched', () => {
  const running = [...parseTasklist(TASKLIST), { name: 'cmd.exe', pid: 7 }, { name: 'discord.exe', pid: 42 }];
  const found = findBlocked(running, ['explorer', 'cmd', 'discord'], [42]);
  assert.deepEqual(found.map((p) => p.pid), [5200]);
});

function fakeGuard(running) {
  const calls = { minimize: [], close: [], notices: 0 };
  const host = { emit: () => {}, notify: () => { calls.notices += 1; } };
  const actions = { minimize: (p) => calls.minimize.push(...p), close: (p) => calls.close.push(...p) };
  const guard = createAppGuard({ host, actions, list: async () => running, every: 60000 });
  return { guard, calls };
}

test('gentle mode minimizes and tells once per app', async () => {
  const { guard, calls } = fakeGuard(parseTasklist(TASKLIST));
  guard.start({ apps: ['discord'], strict: false });
  await new Promise((done) => setImmediate(done));
  guard.stop();
  assert.deepEqual([...new Set(calls.minimize)], [5200]);
  assert.equal(calls.close.length, 0);
  assert.equal(calls.notices, 1);
});

test('strict mode closes, but never a protected app', async () => {
  const { guard, calls } = fakeGuard(parseTasklist(TASKLIST));
  guard.start({ apps: ['discord', 'explorer'], strict: true });
  await new Promise((done) => setImmediate(done));
  guard.stop();
  assert.deepEqual([...new Set(calls.close)], [5200]);
});
