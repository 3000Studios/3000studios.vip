import { useEffect, useRef, useState } from 'react';
import {
  OFFICIAL_YOUTUBE_CHANNEL_ID,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from '../data/officialReleases';

const STORAGE_KEY = '3000-yt-subscriber-perk';
const SEEN_KEY = '3000-yt-subscriber-seen';
const FREE_TRACK = {
  title: 'Not Giving Up Tonight',
  src: '/media/not-giving-up-tonight.mp3',
  watch: 'https://www.youtube.com/watch?v=tIY1WU9N_RU',
  cover: '/media/covers/not-giving-up-tonight.jpg',
};
const SUBSCRIBE_URL = `https://www.youtube.com/channel/${OFFICIAL_YOUTUBE_CHANNEL_ID}?sub_confirmation=1`;

type Status = 'idle' | 'checking' | 'unlocked' | 'need-sub';

declare global {
  interface Window {
    gapi?: { ytsubscribe?: { go: () => void } };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

function loadScript(src: string, marker: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[${marker}]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.ready === '1') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('script failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute(marker.split('=')[0].replace(/[^a-z-]/g, '') === marker ? marker : marker, '1');
    const [attr] = marker.split('=');
    script.setAttribute(attr, '1');
    script.onload = () => {
      script.dataset.ready = '1';
      resolve();
    };
    script.onerror = () => reject(new Error('script failed'));
    document.head.appendChild(script);
  });
}

async function checkSubscription(accessToken: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
  url.searchParams.set('part', 'id');
  url.searchParams.set('mine', 'true');
  url.searchParams.set('forChannelId', OFFICIAL_YOUTUBE_CHANNEL_ID);
  url.searchParams.set('maxResults', '1');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('YouTube API error');
  const data = (await res.json()) as { items?: unknown[] };
  return Boolean(data.items?.length);
}

export function YouTubeSubscriberPerk() {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setStatus('unlocked');
        setBanner(true);
        return;
      }
      if (!localStorage.getItem(SEEN_KEY)) {
        const timer = window.setTimeout(() => setOpen(true), 1800);
        return () => window.clearTimeout(timer);
      }
    } catch {
      const timer = window.setTimeout(() => setOpen(true), 1800);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!open || status === 'unlocked') return;
    void loadScript('https://apis.google.com/js/platform.js', 'data-yt-platform')
      .then(() => window.gapi?.ytsubscribe?.go())
      .catch(() => undefined);
  }, [open, status]);

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const unlock = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    setStatus('unlocked');
    setBanner(true);
    setOpen(true);
    window.dispatchEvent(
      new CustomEvent('3000-play-track', { detail: { src: FREE_TRACK.src, title: FREE_TRACK.title } }),
    );
  };

  const verifyWithGoogle = async () => {
    if (!clientId) return;
    setStatus('checking');
    setError('');
    try {
      await loadScript('https://accounts.google.com/gsi/client', 'data-gis');
      await new Promise<void>((resolve, reject) => {
        const client = window.google?.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/youtube.readonly',
          callback: async (response) => {
            if (!response.access_token) {
              reject(new Error(response.error || 'No token'));
              return;
            }
            try {
              const subscribed = await checkSubscription(response.access_token);
              if (subscribed) unlock();
              else setStatus('need-sub');
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });
        client?.requestAccessToken();
      });
    } catch {
      setStatus('idle');
      setError('Google could not confirm this account. Subscribe on YouTube, then claim the drop.');
    }
  };

  const close = () => {
    markSeen();
    setOpen(false);
  };

  return (
    <>
      {banner && status === 'unlocked' ? (
        <div className="ytSubBanner" role="status">
          <img src={FREE_TRACK.cover} alt="" />
          <div>
            <strong>Subscriber VIP</strong>
            <span>Welcome in. Your free drop is playing: {FREE_TRACK.title}.</span>
          </div>
          <button type="button" className="ytSubBannerClose" onClick={() => setBanner(false)} aria-label="Dismiss banner">
            ×
          </button>
        </div>
      ) : null}

      <button type="button" className="ytSubFab" onClick={() => setOpen(true)}>
        {status === 'unlocked' ? 'Subscriber drop' : 'Free subscriber drop'}
      </button>

      {open ? (
        <div className="ytSubModalScrim" role="dialog" aria-modal="true" aria-labelledby="yt-sub-title">
          <div className="ytSubModal">
            {status === 'unlocked' ? (
              <>
                <p className="vipKicker">Welcome, subscriber</p>
                <h2 id="yt-sub-title">You are in the VIP.</h2>
                <p>Thanks for subscribing to @3000Studio. Your DistroKid drop is unlocked and queued on the site player.</p>
                <div className="ytSubGift">
                  <img src={FREE_TRACK.cover} alt="" />
                  <div>
                    <strong>{FREE_TRACK.title}</strong>
                    <span>Official DistroKid release · free subscriber play</span>
                  </div>
                </div>
                <div className="heroActions">
                  <a className="studioButton ytCta" href={FREE_TRACK.watch} target="_blank" rel="noreferrer">
                    Watch the video
                  </a>
                  <a className="studioButton secondary" href={OFFICIAL_YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer">
                    Open channel
                  </a>
                  <button type="button" className="studioButton ghost" onClick={close}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="vipKicker">@3000Studio perk</p>
                <h2 id="yt-sub-title">Subscribe. Unlock a free drop.</h2>
                <p>
                  YouTube will not tell this site you are subscribed unless you sign in with Google.
                  Use the official subscribe button, then claim the DistroKid track.
                </p>
                <div className="ytSubWidgetWrap" ref={widgetRef}>
                  <div
                    className="g-ytsubscribe"
                    data-channelid={OFFICIAL_YOUTUBE_CHANNEL_ID}
                    data-layout="full"
                    data-count="default"
                    data-theme="dark"
                  />
                </div>
                {status === 'need-sub' ? (
                  <p className="ytSubWarn">Google says this account is not subscribed yet. Hit subscribe, then verify again.</p>
                ) : null}
                {error ? <p className="ytSubWarn">{error}</p> : null}
                <div className="heroActions">
                  <a className="studioButton ytCta" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                    Subscribe on YouTube
                  </a>
                  {clientId ? (
                    <button type="button" className="studioButton secondary" onClick={() => void verifyWithGoogle()} disabled={status === 'checking'}>
                      {status === 'checking' ? 'Checking Google…' : 'Verify with Google'}
                    </button>
                  ) : null}
                  <button type="button" className="studioButton secondary" onClick={unlock}>
                    I subscribed — play my drop
                  </button>
                  <button type="button" className="studioButton ghost" onClick={close}>
                    Not now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
