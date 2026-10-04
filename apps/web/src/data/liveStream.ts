/* ============================================================================
   LIVE STREAM CONFIG — edit these values to point the /live page at a new
   broadcast without touching code. Supported providers: 'youtube' | 'twitch'
   | 'tiktok' | 'cloudflare' | 'custom'.
   - streamEmbedUrl: iframe src for the player (YouTube/Twitch/TikTok embed,
     Cloudflare Stream player, or any custom embed URL).
   - chatEmbedUrl: optional chat iframe (YouTube live chat embed, Twitch chat
     embed, or '' to hide the chat panel).
   - defaultLive: shown when automatic detection is inconclusive.
   ========================================================================== */

export type StreamProvider = 'youtube' | 'twitch' | 'tiktok' | 'cloudflare' | 'custom';

export interface StreamScheduleItem {
  title: string;
  when: string;
  note: string;
}

export const LIVE_STREAM_CONFIG: {
  provider: StreamProvider;
  streamEmbedUrl: string;
  chatEmbedUrl: string;
  channelUrl: string;
  defaultLive: boolean;
  schedule: StreamScheduleItem[];
} = {
  provider: 'youtube',
  // YouTube Live embed for the official channel — replace VIDEO_ID with the
  // live broadcast's ID, or use https://www.youtube.com/embed/live_stream?channel=UCTQnEFZUIutrFuDlxGj9cDA&autoplay=1
  streamEmbedUrl:
    'https://www.youtube.com/embed/live_stream?channel=UCTQnEFZUIutrFuDlxGj9cDA&autoplay=1',
  chatEmbedUrl:
    'https://www.youtube.com/live_chat?v=live&embed_domain=3000studios.vip',
  channelUrl: 'https://www.youtube.com/@3000Studio',
  defaultLive: false,
  schedule: [
    {
      title: 'Studio Session Live',
      when: 'Fridays · 8 PM ET',
      note: 'Beat-making, mix feedback, and track premieres.',
    },
    {
      title: 'Thunderdome Dev Stream',
      when: 'Sundays · 6 PM ET',
      note: 'Boss fights, build progress, and playtesting.',
    },
    {
      title: 'Video Premiere Party',
      when: 'New drops · announced on socials',
      note: 'Watch new official videos with the studio.',
    },
  ],
};
