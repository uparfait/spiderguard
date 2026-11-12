// Site names. Any way a person writes a site becomes one plain host name:
// "https://www.YouTube.com/watch?v=1" -> "youtube.com", "*.reddit.com" ->
// "reddit.com", "bücher.de" -> "xn--bcher-kva.de" (the form DNS uses).
const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function cleanSite(text) {
  let t = String(text).trim().toLowerCase().replace(/^\*\.?/, '');
  if (!/^[a-z][a-z0-9+.-]*:\/\//.test(t)) t = `http://${t}`;
  try {
    return new URL(t).hostname.replace(/\.$/, '').replace(/^www\./, '');
  } catch {
    return '';
  }
}

// A real domain name: dots, letters in the last part (so not an IP address).
export function isDomain(host) {
  return host.length <= 253 && DOMAIN.test(host) && /[a-z]/.test(host.split('.').pop());
}

export const isSite = (text) => !/\.(exe|app)$/i.test(String(text).trim()) && isDomain(cleanSite(text));

// A site rule also covers every subdomain: youtube.com covers m.youtube.com.
export function siteMatches(host, rule) {
  const h = cleanSite(host);
  const r = cleanSite(rule);
  return Boolean(r) && (h === r || h.endsWith(`.${r}`));
}
