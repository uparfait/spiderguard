// The link files and the elevated helper's way out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { linkFiles, readJsonFile, writeJsonFile, helperAlive, waitDone } from '../src/helper-link.js';

const fresh = () => mkdtempSync(join(tmpdir(), 'spiderguard-'));

test('link files round trip as JSON', () => {
  const dir = fresh();
  writeJsonFile(linkFiles(dir).want, { seq: 3, sites: ['x.com'] });
  assert.deepEqual(readJsonFile(linkFiles(dir).want), { seq: 3, sites: ['x.com'] });
  assert.equal(readJsonFile(join(dir, 'missing.json')), null);
});

test('the helper counts as alive only with a fresh heartbeat', () => {
  const dir = fresh();
  assert.ok(!helperAlive(dir));
  writeFileSync(linkFiles(dir).alive, JSON.stringify({ at: 1000 }));
  assert.ok(helperAlive(dir, 2000));
  assert.ok(!helperAlive(dir, 9000));
});

test('waitDone sees the applied request, or gives up', async () => {
  const dir = fresh();
  writeJsonFile(linkFiles(dir).done, { seq: 5, ok: true });
  assert.equal(await waitDone(dir, 5, 1000), true);
  assert.equal(await waitDone(dir, 6, 300), false);
});

test('the helper exits by itself when SpiderGuard is gone', () => {
  const dead = spawnSync(process.execPath, ['-e', 'console.log(process.pid)']).stdout.toString().trim();
  const res = spawnSync(process.execPath, ['src/hosts-helper.js', fresh(), dead], { timeout: 10000 });
  assert.equal(res.status, 0);
});
