// The hosts file block, as pure text work. Blocked sites sit between two
// marker lines and point to 0.0.0.0 (and :: for IPv6). The names in the
// block come from host-names.js.
import { blockLines } from './host-names.js';

export { cleanSites, hostNames, blockLines } from './host-names.js';

export const START = '# focus-guard start';
export const END = '# focus-guard end';

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
