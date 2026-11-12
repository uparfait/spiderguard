# Rules

Code: `src/rules.js`, `src/site-names.js`, `src/app-names.js`,
`src/groups.js`, `src/protected.js`, `src/rules-store.js`.
Tests: `test/rules.test.js`, `test/names.test.js`.

## What a rule is

A rule is one line of text. It is one of three kinds:

| Kind | Example | How it is known |
|---|---|---|
| Group | `Social`, `Video`, `News` | The name of a ready-made group |
| Site | `youtube.com`, `*.reddit.com`, `https://www.x.com/home` | A domain name, not ending in `.exe` or `.app` |
| App | `Spotify`, `Microsoft Teams`, `steam.exe` | Anything else |

A name that is both, like `Battle.net`, blocks the site and the app. The
first rules are `Social` and `Video`. The list is saved with
`host.storage.set("rules", ...)`, trimmed, without repeats, at most 300.

## Groups

| Group | Sites | Apps |
|---|---|---|
| Social | facebook, instagram, x, twitter, tiktok, reddit, snapchat, pinterest, threads | discord, telegram, whatsapp |
| Video | youtube, youtu.be, netflix, twitch, vimeo, primevideo, disneyplus | netflix, vlc |
| News | news.google, cnn, bbc, nytimes, theguardian, aljazeera, news.ycombinator | |

## Sites: any way of writing one

Every form becomes one host name: `HTTPS://WWW.YouTube.com:443/watch`,
`youtube.com/` and `*.youtube.com` all become `youtube.com`. Names with
other letters become the form DNS uses (`bücher.de` -> `xn--bcher-kva.de`).
IP addresses are not sites: the hosts file cannot block them.
A site covers its subdomains; see [sites.md](sites.md) for how.

## Apps: the name people know

App names are compared without case, folder, `.exe`/`.app`, spaces, dots,
dashes or underscores. So `Epic Games Launcher` matches
`EpicGamesLauncher.exe`, and `telegram desktop` matches `telegram-desktop`.

Some apps run under another name. These display names are known
(`src/app-names.js`):

| Rule | Also matches |
|---|---|
| Google Chrome, Microsoft Edge, Firefox, Brave, Opera GX | `chrome`, `msedge`, `firefox`, `brave`, `opera` |
| Teams, Microsoft Teams | `ms-teams`, `teams` |
| VS Code, Visual Studio Code | `code` |
| WhatsApp, Telegram, Discord | `WhatsApp.Root`, `telegram-desktop`, `DiscordPTB`, `DiscordCanary` |
| Steam, Epic Games, Roblox, Minecraft | `steamwebhelper`, `EpicGamesLauncher`, `RobloxPlayerBeta`, `MinecraftLauncher` |
| League of Legends, Valorant, Fortnite, Outlook | `LeagueClient`, `VALORANT-Win64-Shipping`, `FortniteClient-Win64-Shipping`, `olk` |

Protected apps never match, whatever the rules say. See [apps.md](apps.md).

## Changing rules

`rules.set` saves the list. During a focus session the new blocks apply at
once. The page has toggles for the groups and chips for single rules.
