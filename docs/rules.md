# Rules

Code: `src/rules.js`, `src/groups.js`, `src/protected.js`,
`src/rules-store.js`. Tests: `test/rules.test.js`.

## What a rule is

A rule is one line of text. It is one of three kinds:

| Kind | Example | How it is known |
|---|---|---|
| Group | `Social`, `Video`, `News` | The name of a ready-made group |
| Site | `youtube.com`, `https://www.reddit.com/r/all` | Looks like a domain, and does not end in `.exe` or `.app` |
| App | `Spotify`, `steam.exe`, `/Applications/Slack.app` | Anything else |

The first time, the rules are `Social` and `Video`. The list is saved with
`host.storage.set("rules", ...)`, trimmed, without repeats, at most 300.

## Groups

| Group | Sites | Apps |
|---|---|---|
| Social | facebook, instagram, x, twitter, tiktok, reddit, snapchat, pinterest, threads | discord, telegram, whatsapp |
| Video | youtube, youtu.be, netflix, twitch, vimeo, primevideo, disneyplus | netflix, vlc |
| News | news.google, cnn, bbc, nytimes, theguardian, aljazeera, news.ycombinator | |

## Matching

- Names are compared in lowercase. `www.` is taken off. A link is cut down
  to its host: `https://www.YouTube.com/watch` becomes `youtube.com`.
- A site also covers its subdomains: `youtube.com` covers `m.youtube.com`,
  but not `notyoutube.com` or `youtube.com.example.net`.
- An app name is the program name without folder, `.exe` or `.app`:
  `C:\Apps\Spotify.exe` and `Spotify` are the same.
- Protected apps never match, whatever the rules say. See [apps.md](apps.md).

## Changing rules

`rules.set` saves the list. During a focus session the new blocks apply at
once. The page has toggles for the groups and chips for single sites and
apps.
