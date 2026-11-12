// Site coverage: subdomains, other domains of popular sites, and the
// keeper that puts the block back if something removes it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hostNames, blockLines, cleanSites } from '../src/hosts.js';
import { expand } from '../src/rules.js';
import { createSiteKeeper } from '../src/site-keeper.js';

test('a site also blocks the subdomains people really use', () => {
  const names = hostNames(['spotify.com', 'reddit.com', 'bbc.co.uk']);
  for (const n of ['spotify.com', 'open.spotify.com', 'www.reddit.com', 'old.reddit.com',
    'm.reddit.com', 'www.bbc.co.uk', 'redd.it', 'i.redd.it']) assert.ok(names.includes(n), n);
});

test('popular sites also block the domains they load from', () => {
  const names = hostNames(['youtube.com', 'x.com']);
  for (const n of ['music.youtube.com', 'youtu.be', 'www.youtube-nocookie.com', 'i.ytimg.com',
    'youtubei.googleapis.com', 't.co', 'twitter.com', 'pbs.twimg.com']) assert.ok(names.includes(n), n);
});

test('a subdomain rule blocks exactly that host', () => {
  assert.deepEqual(hostNames(['news.google.com']), ['news.google.com']);
});

test('every group can be blocked and stays a sane size', () => {
  const { sites } = expand(['Social', 'Video', 'News']);
  const lines = blockLines(sites);
  assert.ok(lines.length > 1000 && lines.length < 12000, String(lines.length));
  for (const line of lines) assert.match(line, /^(0\.0\.0\.0|::) [a-z0-9.-]+$/);
});

test('IP addresses never reach the hosts file', () => {
  assert.deepEqual(cleanSites(['10.0.0.1', 'x.com']), ['x.com']);
});

test('the keeper puts a removed block back, without asking for admin rights', async () => {
  const calls = [];
  let present = true;
  const sites = { apply: async (list, opts) => { calls.push([list, opts]); present = true; } };
  const keeper = createSiteKeeper({ sites, every: 60000, hasBlock: () => present });
  keeper.start(['youtube.com']);
  await keeper.check();
  assert.equal(calls.length, 0);
  present = false;
  await keeper.check();
  assert.deepEqual(calls, [[['youtube.com'], { prompt: false }]]);
  keeper.stop();
  present = false;
  await keeper.check();
  assert.equal(calls.length, 1);
});
