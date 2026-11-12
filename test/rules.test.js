// Rule matching: sites, subdomains, groups and protected apps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSite, cleanApp, siteMatches, appMatches, expand, cleanRules } from '../src/rules.js';

test('matching covers subdomains', () => {
  assert.ok(siteMatches('youtube.com', 'youtube.com'));
  assert.ok(siteMatches('m.youtube.com', 'youtube.com'));
  assert.ok(siteMatches('WWW.YouTube.com', 'https://www.youtube.com/watch?v=1'));
  assert.ok(!siteMatches('notyoutube.com', 'youtube.com'));
  assert.ok(!siteMatches('youtube.com.evil.net', 'youtube.com'));
});

test('names are cleaned to lowercase without www or paths', () => {
  assert.equal(cleanSite('https://www.Reddit.com/r/all'), 'reddit.com');
  assert.equal(cleanApp('C:\\Program Files\\Spotify\\Spotify.exe'), 'spotify');
  assert.equal(cleanApp('/Applications/Slack.app/Contents/MacOS/Slack'), 'slack');
});

test('protected apps are never matched', () => {
  const apps = ['explorer', 'finder', 'cmd', 'abc', 'node', 'svchost', 'spotify'];
  assert.ok(!appMatches('explorer.exe', apps));
  assert.ok(!appMatches('Finder', apps));
  assert.ok(!appMatches('cmd.exe', apps));
  assert.ok(!appMatches('abc.exe', apps));
  assert.ok(!appMatches('svchost.exe', apps));
  assert.ok(appMatches('Spotify.exe', apps));
});

test('protected apps never make it into the block list', () => {
  assert.deepEqual(expand(['explorer', 'powershell.exe', 'Terminal']).apps, []);
});

test('groups, sites and apps expand into lists', () => {
  const { sites, apps } = expand(['Social', 'example.org', 'Spotify', 'steam.exe']);
  assert.ok(sites.includes('reddit.com'));
  assert.ok(sites.includes('example.org'));
  assert.ok(apps.includes('discord'));
  assert.ok(apps.includes('spotify'));
  assert.ok(apps.includes('steam'));
});

test('saved rules are trimmed and kept unique', () => {
  assert.deepEqual(cleanRules([' Video ', 'video', '', 'x.com']), ['Video', 'x.com']);
  assert.deepEqual(cleanRules('nope'), []);
});
