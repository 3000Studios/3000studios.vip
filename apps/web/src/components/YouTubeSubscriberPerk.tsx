import { useEffect, useState } from 'react';
import {
  OFFICIAL_YOUTUBE_CHANNEL_ID,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from '../data/officialReleases';

const STORAGE_KEY = '3000-yt-subscriber-perk';
const FREE_TRACK = {
  title: 'Not Giving Up Tonight',
  src: '/media/always-feel-like.mp3',
  watch: 'https://www.youtube.com/watch?v=tIY1WU9N_RU',
};

const SUBSCRIBE_URL = `${OFFICIAL_YOUTUBE_CHANNEL_URL}?sub_confirmation=1`;

type Status = 'idle' | 'checking' | 'unlocked' | 'need-sub';

declare global {
  interface Window {
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

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('GIS failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.gis = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GIS failed'));
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
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const [status, setStatus] = useState<Status>('idle');
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setStatus('unlocked');
        setBanner(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const unlock = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
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
    if (!clientId) {
      setError('Google client ID is not set yet. Subscribe on YouTube, then confirm below.');
      return;
    }
    setStatus('checking');
    setError('');
    try {
      await loadGis();
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
      setError('Could not verify with Google. Subscribe on YouTube, then confirm below.');
    }
  };

  return (
    <>
      {banner && status === 'unlocked' ? (
        <div className="ytSubBanner" role="status">
          <strong>Subscriber VIP</strong>
          <span>Welcome back. Your free drop is unlocked.</span>
          <button type="button" className="ytSubBannerClose" onClick={() => setBanner(false)} aria-label="Dismiss banner">
            ×
          </button>
        </div>
      ) : null}

      <button type="button" className="ytSubFab" onClick={() => setOpen(true)}>
        {status === 'unlocked' ? 'Subscriber perk' : 'YouTube perk'}
      </button>

      {open ? (
        <div className="ytSubModalScrim" role="dialog" aria-modal="true" aria-labelledby="yt-sub-title">
          <div className="ytSubModal">
            {status === 'unlocked' ? (
              <>
                <p className="vipKicker">Subscriber welcome</p>
                <h2 id="yt-sub-title">You made the cut.</h2>
                <p>Thanks for riding with @3000Studio. Your subscriber drop is unlocked — hit play on the free track.</p>
                <audio className="ytSubAudio" src={FREE_TRACK.src} controls preload="none" />
                <div className="heroActions">
                  <a className="studioButton secondary" href={FREE_TRACK.watch} target="_blank" rel="noreferrer">
                    Watch the video
                  </a>
                  <button type="button" className="studioButton ghost" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="vipKicker">Subscriber perk</p>
                <h2 id="yt-sub-title">Subscribe. Get a free drop.</h2>
                <p>
                  YouTube will not tell this site you are subscribed unless you sign in with Google and allow a one-time check.
                  Subscribe first, then verify.
                </p>
                {status === 'need-sub' ? (
                  <p className="ytSubWarn">Google says this account is not subscribed to the official channel yet.</p>
                ) : null}
                {error ? <p className="ytSubWarn">{error}</p> : null}
                <div className="heroActions">
                  <a className="studioButton ytCta" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                    Subscribe on YouTube
                  </a>
                  {clientId ? (
                    <button type="button" className="studioButton secondary" onClick={() => void verifyWithGoogle()} disabled={status === 'checking'}>
                      {status === 'checking' ? 'Checking…' : 'Verify with Google'}
                    </button>
                  ) : (
                    <button type="button" className="studioButton secondary" onClick={unlock}>
                      I subscribed — unlock perk
                    </button>
                  )}
                  <button type="button" className="studioButton ghost" onClick={() => setOpen(false)}>
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
