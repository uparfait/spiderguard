// App and site names: what people type must match what really runs or loads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normApp, appNamesFor } from '../src/app-names.js';
import { cleanSite, isSite } from '../src/site-names.js';
import { expand, appMatches } from '../src/rules.js';

test('display names match the program names apps run as', () => {
  const { apps } = expand(['Microsoft Teams', 'Google Chrome', 'VS Code', 'Epic Games Launcher', 'WhatsApp']);
  assert.ok(appMatches('ms-teams.exe', apps));
  assert.ok(appMatches('chrome.exe', apps));
  assert.ok(appMatches('Code.exe', apps));
  assert.ok(appMatches('EpicGamesLauncher.exe', apps));
  assert.ok(appMatches('WhatsApp.Root.exe', apps));
  assert.ok(!appMatches('msedge.exe', apps));
});

test('spaces, dots, dashes and case do not matter', () => {
  assert.equal(normApp('Telegram-Desktop'), normApp('telegram desktop'));
  assert.equal(normApp('C:\\Games\\Riot Client\\VALORANT.exe'), 'valorant');
  assert.deepEqual(appNamesFor('Discord'), ['discord', 'discordptb', 'discordcanary']);
});

test('many apps in one list are all matched', () => {
  const { apps } = expand(['Spotify', 'Steam', 'Discord', 'Telegram', 'Slack', 'Zoom', 'VLC', 'Roblox']);
  for (const name of ['Spotify.exe', 'steamwebhelper.exe', 'Discord.exe', 'telegram-desktop',
    'slack', 'Zoom.exe', 'vlc.exe', 'RobloxPlayerBeta.exe']) assert.ok(appMatches(name, apps), name);
});

test('a name that is both a site and an app blocks both', () => {
  const { sites, apps } = expand(['Battle.net']);
  assert.deepEqual(sites, ['battle.net']);
  assert.ok(appMatches('Battle.net.exe', apps));
});

test('any way of writing a site gives one host name', () => {
  assert.equal(cleanSite('*.reddit.com'), 'reddit.com');
  assert.equal(cleanSite('HTTPS://WWW.YouTube.com:443/watch?v=1#t'), 'youtube.com');
  assert.equal(cleanSite('open.spotify.com/'), 'open.spotify.com');
  assert.equal(cleanSite('bücher.de'), 'xn--bcher-kva.de');
  assert.ok(isSite('*.reddit.com'));
  assert.deepEqual(expand(['*.reddit.com']).apps, []);
});

test('IP addresses and plain words are not sites', () => {
  assert.ok(!isSite('192.168.1.10'));
  assert.ok(!isSite('Spotify'));
  assert.ok(!isSite('steam.exe'));
});
