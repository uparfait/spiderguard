// App names: what people type, and the program names apps really run as.
// Names are compared after normApp: lowercase, no folder, no ".exe" or
// ".app", and no spaces, dots, dashes or underscores. So "Epic Games
// Launcher" matches EpicGamesLauncher.exe, and "ms-teams" matches "MS Teams".
export const normApp = (text) => (String(text).trim().toLowerCase()
  .split(/[\\/]/).filter(Boolean).pop() || '')
  .replace(/\.(exe|app)$/, '').replace(/[\s._-]+/g, '');

// Display names whose program has another name. Keys are already normalized.
const ALIASES = {
  googlechrome: ['chrome'],
  edge: ['msedge'],
  microsoftedge: ['msedge'],
  mozillafirefox: ['firefox'],
  bravebrowser: ['brave'],
  operagx: ['opera'],
  teams: ['msteams'],
  microsoftteams: ['msteams', 'teams'],
  vscode: ['code'],
  visualstudiocode: ['code'],
  whatsapp: ['whatsapproot'],
  telegram: ['telegramdesktop'],
  discord: ['discordptb', 'discordcanary'],
  steam: ['steamwebhelper'],
  epicgames: ['epicgameslauncher'],
  battlenet: ['battlenet'],
  roblox: ['robloxplayerbeta'],
  minecraft: ['minecraftlauncher'],
  leagueoflegends: ['leagueclient', 'leagueclientux'],
  valorant: ['valorantwin64shipping', 'riotclientservices'],
  fortnite: ['fortniteclientwin64shipping', 'fortnitelauncher'],
  outlook: ['olk']
};

export const hasAlias = (text) => Object.hasOwn(ALIASES, normApp(text));

// Every program name a rule stands for: its own name and its aliases.
export function appNamesFor(text) {
  const name = normApp(text);
  if (!name) return [];
  return [...new Set([name, ...(Object.hasOwn(ALIASES, name) ? ALIASES[name] : [])])];
}

// A short name to show people: "C:\\Apps\\Spotify.exe" -> "Spotify".
export const showApp = (text) => (String(text).split(/[\\/]/).filter(Boolean).pop() || '')
  .replace(/\.(exe|app)$/i, '');
