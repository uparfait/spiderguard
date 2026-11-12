// Timer tests with a fake clock: plain numbers, so they run in milliseconds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MINUTE, idle, startFocus, left, settle, stop, resume } from '../src/timer.js';

const T0 = 1_700_000_000_000;
const saved = (state) => JSON.parse(JSON.stringify(state));

test('the timer resumes after a restart', () => {
  const s = startFocus(idle(), { minutes: 25 }, T0);
  const { state, ended } = resume(saved(s), T0 + 10 * MINUTE);
  assert.equal(state.phase, 'focus');
  assert.equal(left(state, T0 + 10 * MINUTE), 15 * MINUTE);
  assert.equal(ended.length, 0);
});

test('a session that ended while closed moves on to its break', () => {
  const s = startFocus(idle(), { minutes: 25 }, T0);
  const { state, ended } = resume(saved(s), T0 + 27 * MINUTE);
  assert.equal(state.phase, 'short');
  assert.equal(left(state, T0 + 27 * MINUTE), 3 * MINUTE);
  assert.equal(ended[0].phase, 'focus');
});

test('every 4th session gets a long break, and breaks end in idle', () => {
  let s = { ...startFocus(idle(3), {}, T0) };
  s = settle(s, T0 + 25 * MINUTE).state;
  assert.equal(s.phase, 'long');
  assert.equal(s.round, 4);
  assert.equal(settle(s, s.endsAt).state.phase, 'idle');
});

test('minutes stay within the 2 hour hard limit', () => {
  assert.equal(startFocus(idle(), { minutes: 500 }, T0).endsAt, T0 + 120 * MINUTE);
  assert.equal(startFocus(idle(), { minutes: -3 }, T0).endsAt, T0 + MINUTE);
});

test('strict sessions cannot end early, gentle ones can', () => {
  assert.throws(() => stop(startFocus(idle(), { strict: true }, T0)));
  assert.equal(stop(startFocus(idle(), {}, T0)).phase, 'idle');
});

test('bad saved data gives idle', () => {
  assert.equal(resume(null, T0).state.phase, 'idle');
  assert.equal(resume({ phase: 'focus', round: 0, startedAt: T0, endsAt: T0 + 999 * MINUTE }, T0).state.phase, 'idle');
});
