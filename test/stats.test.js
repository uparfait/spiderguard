// History lines and the daily stats, with a fixed "now".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addHistory, readHistory } from '../src/history.js';
import { computeStats } from '../src/stats.js';

const DAY = 86400000;
const NOW = new Date(2026, 10, 12, 15, 0).getTime();

test('history keeps one line per finished session and skips bad lines', () => {
  const dir = mkdtempSync(join(tmpdir(), 'spiderguard-'));
  addHistory(dir, { start: NOW, minutes: 25, kind: 'focus' });
  appendFileSync(join(dir, 'history.json'), '{broken\n');
  addHistory(dir, { start: NOW, minutes: 7.25, kind: 'early' });
  addHistory(dir, { start: NOW, minutes: 5, kind: 'short' });
  assert.deepEqual(readHistory(dir).map((e) => e.minutes), [25, 7.3]);
});

test('today, sessions and the streak come from the history', () => {
  const entries = [
    { start: NOW - 2 * DAY, minutes: 25, kind: 'focus' },
    { start: NOW - DAY, minutes: 25, kind: 'focus' },
    { start: NOW - 3600000, minutes: 25, kind: 'focus' },
    { start: NOW - 1800000, minutes: 10, kind: 'early' }
  ];
  const s = computeStats(entries, NOW);
  assert.equal(s.minutesToday, 35);
  assert.equal(s.sessionsToday, 1);
  assert.equal(s.streak, 3);
  assert.equal(s.week.length, 7);
  assert.equal(s.week[6].minutes, 35);
});

test('the streak holds until today ends, and breaks on a missed day', () => {
  const yesterday = [{ start: NOW - DAY, minutes: 25, kind: 'focus' }];
  assert.equal(computeStats(yesterday, NOW).streak, 1);
  const gap = [{ start: NOW - 3 * DAY, minutes: 25, kind: 'focus' }];
  assert.equal(computeStats(gap, NOW).streak, 0);
});
