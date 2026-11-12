// Which host names go into the hosts file for a list of blocked sites.
import { cleanSite, isDomain } from './site-names.js';
import { PREFIXES, extrasFor } from './site-extras.js';

const MAX_SITES = 500;
const MAX_NAMES = 6000;

// Only plain domain names (no IP addresses, no odd text) reach the hosts file.
export function cleanSites(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map(cleanSite).filter(isDomain))].slice(0, MAX_SITES);
}

// A main domain like "youtube.com" or "bbc.co.uk", which gets the prefixes.
function isMain(host) {
  const parts = host.split('.');
  return parts.length === 2 || (parts.length === 3 && parts[1].length <= 3 && parts[2].length === 2);
}

// Each site, its common subdomains, and the other domains popular sites
// load from. A subdomain rule like "news.google.com" stays exact.
export function hostNames(sites) {
  const names = new Set();
  const add = (host) => {
    names.add(host);
    if (isMain(host)) for (const p of PREFIXES) names.add(`${p}.${host}`);
  };
  for (const site of cleanSites(sites)) {
    add(site);
    extrasFor(site).forEach(add);
  }
  return [...names].slice(0, MAX_NAMES);
}

// Two lines per name: IPv4 and IPv6 both point nowhere.
export const blockLines = (sites) => hostNames(sites).flatMap((n) => [`0.0.0.0 ${n}`, `:: ${n}`]);
