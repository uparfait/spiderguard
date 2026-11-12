// Reads and writes the system hosts file, then flushes DNS so the change
// works at once. Writing needs admin rights; see elevate.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { addBlock, removeBlock, hasBlock } from './hosts.js';

export function hostsPath() {
  if (process.platform !== 'win32') return '/etc/hosts';
  return join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'drivers', 'etc', 'hosts');
}

export function readHosts() {
  try { return readFileSync(hostsPath(), 'utf8'); } catch { return ''; }
}

export const hostsHasBlock = () => hasBlock(readHosts());

const FLUSH = {
  win32: ['ipconfig', ['/flushdns']],
  darwin: ['dscacheutil', ['-flushcache']],
  linux: ['resolvectl', ['flush-caches']]
};

export function flushDns() {
  const step = FLUSH[process.platform];
  if (step) spawnSync(step[0], step[1], { stdio: 'ignore', windowsHide: true, timeout: 5000 });
}

// Blocks these sites, or removes the block when the list is empty.
// Throws EPERM or EACCES when the app has no admin rights.
export function writeSites(sites) {
  const before = readHosts();
  const after = sites.length ? addBlock(before, sites) : removeBlock(before);
  if (after === before) return false;
  writeFileSync(hostsPath(), after);
  flushDns();
  return true;
}
