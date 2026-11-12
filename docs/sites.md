# Blocking sites

Code: `src/hosts.js` (pure text), `src/hosts-file.js` (file and DNS),
`src/sites.js` (direct write or helper), `src/elevate.js`,
`src/hosts-helper.js`, `src/helper-link.js`.
Tests: `test/hosts.test.js`, `test/helper.test.js`.

## The hosts file block

Blocked sites go into the system hosts file between two markers:

```text
# focus-guard start
0.0.0.0 youtube.com
:: youtube.com
0.0.0.0 www.youtube.com
...
# focus-guard end
```

- The hosts file has no wildcards, so `www.` and `m.` are added for each site.
- Adding again replaces the block, so there is only ever one.
- Removing takes out every line from start to end marker and nothing else.
- Only plain domain names (`a-z`, `0-9`, `-`, `.`) are written, at most 500.
- After a change, DNS is flushed: `ipconfig /flushdns` (Windows),
  `dscacheutil -flushcache` (macOS), `resolvectl flush-caches` (Linux).

Hosts file: `%SystemRoot%\System32\drivers\etc\hosts` or `/etc/hosts`.

## Admin rights, asked once

abc runs apps with normal user rights, so writing the hosts file usually
fails. Then:

1. SpiderGuard sends a `notice` with the reason to the page, and starts the
   helper through the OS prompt: UAC on Windows, the password box on macOS
   (with the reason), polkit on Linux.
2. The helper keeps running with admin rights. SpiderGuard writes the wanted
   list to `hosts-want.json` in the data folder. The helper applies it and
   writes `hosts-done.json`. It writes `helper.json` twice a second to show
   it is alive.
3. Only one prompt is open at a time. If the person says no, SpiderGuard does
   not ask again until they start a new session, and the page says sites
   are not blocked. Apps are still held back.

## Always cleaned up

The block is removed:

- at the end of a session (going to a break or idle);
- on `shutdown` and when stdin closes, before exiting;
- at startup, in case abc crashed, unless a focus session is resumed;
- by the helper itself, when SpiderGuard's process is gone (it checks
  twice a second), and then the helper exits.

`SPIDERGUARD_DRY_RUN=1` turns off all system changes. Only the tests use
it; abc does not pass it to apps.
