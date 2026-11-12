// Ready-made rule groups. A rule named "Social", "Video" or "News"
// expands to these sites and apps.
export const GROUPS = {
  social: {
    label: 'Social',
    sites: ['facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'tiktok.com',
      'reddit.com', 'snapchat.com', 'pinterest.com', 'threads.net'],
    apps: ['discord', 'telegram', 'whatsapp']
  },
  video: {
    label: 'Video',
    sites: ['youtube.com', 'youtu.be', 'netflix.com', 'twitch.tv', 'vimeo.com',
      'primevideo.com', 'disneyplus.com'],
    apps: ['netflix', 'vlc']
  },
  news: {
    label: 'News',
    sites: ['news.google.com', 'cnn.com', 'bbc.com', 'bbc.co.uk', 'nytimes.com',
      'theguardian.com', 'aljazeera.com', 'news.ycombinator.com'],
    apps: []
  }
};

export const groupLabels = () => Object.values(GROUPS).map((g) => g.label);
