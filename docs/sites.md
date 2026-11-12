# Blocking sites

Code: `src/hosts.js`, `src/host-names.js`, `src/site-extras.js`,
`src/hosts-file.js`, `src/sites.js`, `src/site-keeper.js`, `src/elevate.js`,
`src/hosts-helper.js`, `src/helper-link.js`.
Tests: `test/hosts.test.js`, `test/coverage.test.js`, `test/helper.test.js`.

## The hosts file block

Blocked sites go into the system hosts file (`%SystemRoot%\System32\drivers\etc\hosts`
or `/etc/hosts`) between `# focus-guard start` and `# focus-guard end`.
Each name points to `0.0.0.0` and `::`, so it loads nothing, in every
browser and app. Adding again replaces the block; removing takes out only
those lines. DNS is flushed after each change (`ipconfig /flushdns`,
`dscacheutil -flushcache`, `resolvectl flush-caches`).

## What one site covers

The hosts file has no wildcards, so each site is written out with:

- **Subdomains people use** (35 of them): `www`, `m`, `mobile`, `web`,
  `app`, `open`, `music`, `old`, `api`, `login`, `mail`, `chat` and more.
  So `spotify.com` also blocks `open.spotify.com`, and `reddit.com`
  blocks `old.reddit.com`.
- **The other domains popular sites load from**: short links (`youtu.be`,
  `t.co`, `redd.it`), images and video (`ytimg.com`, `twimg.com`,
  `fbcdn.net`), and APIs (`youtubei.googleapis.com`). The list is in
  `src/site-extras.js`.

A subdomain rule (`news.google.com`) blocks exactly that host. All three
groups together are about 4,400 lines, well within what the hosts file handles.

## Admin rights, asked once

abc runs apps with normal user rights, so writing the hosts file usually
fails. SpiderGuard then sends a `notice` with the reason, and starts one
helper through the OS prompt (UAC, the macOS password box, or polkit). The
helper keeps running with admin rights: SpiderGuard writes the list to
`hosts-want.json`, the helper applies it and answers in `hosts-done.json`,
and shows it is alive in `helper.json`. Only one prompt is open at a time.
If the person says no, sites stay open until the next session; apps are
still held back.

## Kept in place, always cleaned up

- Every 15 seconds during focus, if something removed the block (another
  program, an antivirus clean-up, a hand edit), it is put back, without a
  new prompt.
- The block is removed at the end of focus, on `shutdown` and when stdin
  closes, at startup after a crash (unless focus resumes), and by the helper
  itself when SpiderGuard's process is gone.

## Good to know

- A tab that was already open keeps what it loaded, and may keep its open
  connection for a short while. New tabs and new loads are blocked at once.
- `SPIDERGUARD_DRY_RUN=1` turns off all system changes. Only tests use it.
