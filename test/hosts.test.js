// The hosts block is added once and removed completely.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { START, END, addBlock, removeBlock, hasBlock, cleanSites, blockLines } from '../src/hosts.js';

const HOSTS = '# Copyright Microsoft\r\n127.0.0.1 localhost\r\n::1 localhost\r\n';
const count = (text, line) => text.split(/\r?\n/).filter((l) => l === line).length;

test('the hosts block is added once', () => {
  const once = addBlock(HOSTS, ['youtube.com']);
  const twice = addBlock(once, ['youtube.com', 'reddit.com']);
  assert.equal(count(twice, START), 1);
  assert.equal(count(twice, END), 1);
  assert.ok(twice.includes('0.0.0.0 www.reddit.com'));
  assert.ok(twice.includes('0.0.0.0 m.youtube.com'));
  assert.ok(twice.startsWith(HOSTS));
});

test('the hosts block is removed completely', () => {
  const blocked = addBlock(HOSTS, ['youtube.com', 'x.com']);
  assert.ok(hasBlock(blocked));
  const clean = removeBlock(blocked);
  assert.equal(clean, HOSTS);
  assert.ok(!hasBlock(clean));
  assert.ok(!clean.includes('youtube'));
});

test('other lines and line endings are kept', () => {
  const unix = '127.0.0.1 localhost\n10.0.0.2 nas\n';
  assert.equal(removeBlock(addBlock(unix, ['x.com'])), unix);
  assert.ok(!addBlock(unix, ['x.com']).includes('\r\n'));
});

test('an empty list adds no block', () => {
  assert.equal(addBlock(HOSTS, []), HOSTS);
});

test('only plain domain names reach the hosts file', () => {
  assert.deepEqual(cleanSites(['YouTube.com', 'bad host\n1.2.3.4 bank.com', '../etc', 'x.com']), ['youtube.com', 'x.com']);
  for (const line of blockLines(['x.com'])) assert.match(line, /^(0\.0\.0\.0|::) [a-z0-9.-]+$/);
});
