// The hosts file has no wildcards, so a blocked site also gets the
// subdomains people really use, and popular sites get the other domains
// they load from (short links, images, video, APIs).

// Added in front of every main domain, like "music.youtube.com".
export const PREFIXES = ['www', 'm', 'mobile', 'web', 'app', 'apps', 'open', 'music', 'video',
  'videos', 'tv', 'live', 'play', 'watch', 'old', 'new', 'beta', 'en', 'i', 'api', 'static',
  'cdn', 'media', 'img', 'images', 'login', 'accounts', 'auth', 'mail', 'chat', 'gaming',
  'shorts', 'news', 'business', 'business-api'];

// Other domains a site needs. Keys and values are plain host names.
export const EXTRAS = {
  'youtube.com': ['youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'i.ytimg.com', 's.ytimg.com',
    'yt3.ggpht.com', 'youtubei.googleapis.com', 'youtube.googleapis.com', 'youtubekids.com'],
  'facebook.com': ['fb.com', 'fb.me', 'fb.watch', 'fbcdn.net', 'static.xx.fbcdn.net',
    'scontent.xx.fbcdn.net', 'facebook.net', 'connect.facebook.net', 'messenger.com'],
  'instagram.com': ['instagr.am', 'cdninstagram.com', 'static.cdninstagram.com'],
  'x.com': ['twitter.com', 't.co', 'twimg.com', 'pbs.twimg.com', 'abs.twimg.com', 'video.twimg.com'],
  'twitter.com': ['x.com', 't.co', 'twimg.com', 'pbs.twimg.com', 'abs.twimg.com', 'video.twimg.com'],
  'tiktok.com': ['vm.tiktok.com', 'tiktokv.com', 'tiktokcdn.com', 'tiktokcdn-us.com', 'ttwstatic.com'],
  'reddit.com': ['redd.it', 'i.redd.it', 'v.redd.it', 'preview.redd.it', 'redditmedia.com',
    'redditstatic.com', 'www.redditstatic.com', 'reddituploads.com'],
  'snapchat.com': ['snap.com', 'sc-cdn.net', 'sc-static.net'],
  'pinterest.com': ['pin.it', 'pinimg.com', 'i.pinimg.com', 's.pinimg.com'],
  'threads.net': ['threads.com'],
  'linkedin.com': ['lnkd.in', 'licdn.com', 'static.licdn.com', 'media.licdn.com'],
  'whatsapp.com': ['wa.me', 'whatsapp.net'],
  'discord.com': ['discord.gg', 'discordapp.com', 'discordapp.net', 'discord.media', 'cdn.discordapp.com'],
  'netflix.com': ['nflximg.net', 'nflxext.com', 'nflxso.net', 'nflxvideo.net', 'assets.nflxext.com'],
  'twitch.tv': ['gql.twitch.tv', 'usher.ttvnw.net', 'ttvnw.net', 'jtvnw.net', 'static-cdn.jtvnw.net',
    'twitchcdn.net', 'static.twitchcdn.net'],
  'vimeo.com': ['player.vimeo.com', 'vimeocdn.com', 'f.vimeocdn.com', 'i.vimeocdn.com'],
  'primevideo.com': ['aiv-cdn.net', 'atv-ps.amazon.com'],
  'disneyplus.com': ['bamgrid.com', 'disney-plus.net', 'dssott.com'],
  'spotify.com': ['open.spotify.com', 'scdn.co', 'i.scdn.co', 'spotifycdn.com'],
  'tumblr.com': ['tmblr.co', 'media.tumblr.com', 'assets.tumblr.com'],
  '9gag.com': ['img-9gag-fun.9cache.com']
};

export const extrasFor = (site) => (Object.hasOwn(EXTRAS, site) ? EXTRAS[site] : []);
