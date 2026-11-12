// The hosts file block, as pure text work. Blocked sites sit between two
// marker lines and point to 0.0.0.0 (and :: for IPv6).
import { cleanSite } from './rules.js';

export const START = '# focus-guard start';
export const END = '# focus-guard end';
const SAFE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const MAX_SITES = 500;

// Only plain domain names reach the hosts file.
export function cleanSites(list) {
  if (!Array.isArray(list)) return [];
  const sites = list.map(cleanSite).filter((s) => s.length <= 253 && SAFE.test(s));
  return [...new Set(sites)].slice(0, MAX_SITES);
}

// The hosts file has no wildcards, so common subdomains are listed too.
export function blockLines(sites) {
  const names = new Set();
  for (const s of cleanSites(sites)) for (const n of [s, `www.${s}`, `m.${s}`]) names.add(n);
  return [...names].flatMap((n) => [`0.0.0.0 ${n}`, `:: ${n}`]);
}

const newline = (text) => (text.includes('\r\n') ? '\r\n' : '\n');

// Takes out every line from our start marker to our end marker.
export function removeBlock(text) {
  const out = [];
  let inside = false;
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t === START) inside = true;
    else if (t === END) inside = false;
    else if (!inside) out.push(line);
  }
  return out.join(newline(text));
}

// Puts one fresh block at the end. Adding twice still gives one block.
export function addBlock(text, sites) {
  const nl = newline(text);
  const base = removeBlock(text);
  const lines = blockLines(sites);
  if (!lines.length) return base;
  const head = base.length && !base.endsWith(nl) ? base + nl : base;
  return head + [START, ...lines, END].join(nl) + nl;
}

export const hasBlock = (text) => text.split(/\r?\n/).some((l) => l.trim() === START);
