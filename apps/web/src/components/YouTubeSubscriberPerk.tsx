import { useEffect, useState } from 'react';
import {
  OFFICIAL_YOUTUBE_CHANNEL_ID,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from '../data/officialReleases';

const STORAGE_KEY = '3000-yt-subscriber-perk';
const PROMPT_KEY = '3000-yt-perk-prompted';
const CLICKED_SUB_KEY = '3000-yt-clicked-subscribe';

const FREE_TRACK = {
  title: 'Not Giving Up Tonight',
  src: '/media/not-giving-up-tonight.mp3',
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
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const data = (await res.json()) as { items?: unknown[] };
  return Boolean(data.items?.length);
}

export function YouTubeSubscriberPerk() {
  const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const canVerify = Boolean(clientId);
  const [status, setStatus] = useState<Status>('idle');
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState(false);
  const [clickedSub, setClickedSub] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setStatus('unlocked');
        setBanner(true);
      }
      if (sessionStorage.getItem(CLICKED_SUB_KEY) === '1') setClickedSub(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (status === 'unlocked') return;
    try {
      if (sessionStorage.getItem(PROMPT_KEY) === '1') return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(PROMPT_KEY, '1');
      } catch {
        /* ignore */
      }
      setOpen(true);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const markSubscribeClick = () => {
    setClickedSub(true);
    try {
      sessionStorage.setItem(CLICKED_SUB_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const playDrop = () => {
    window.dispatchEvent(
      new CustomEvent('3000-play-track', {
        detail: { src: FREE_TRACK.src, title: FREE_TRACK.title },
      }),
    );
  };

  const unlock = (playNow: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setStatus('unlocked');
    setBanner(true);
    setOpen(true);
    if (playNow) playDrop();
  };

  const verifyWithGoogle = async () => {
    if (!canVerify) return;
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
              if (subscribed) unlock(true);
              else {
                setStatus('need-sub');
                setError('');
              }
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });
        if (!client) {
          reject(new Error('Google Identity not ready'));
          return;
        }
        client.requestAccessToken();
      });
    } catch {
      setStatus('idle');
      setError('Google could not finish the check. Subscribe first, then try Verify again.');
    }
  };

  const honorUnlock = () => {
    if (!clickedSub) {
      setError('Tap Subscribe on YouTube first. Then come back and unlock.');
      return;
    }
    unlock(true);
  };

  return (
    <>
      {banner && status === 'unlocked' ? (
        <div className="ytSubBanner" role="status">
          <strong>Subscriber VIP</strong>
          <span>Welcome in. Your free drop is unlocked.</span>
          <button type="button" className="ytSubBannerPlay" onClick={playDrop}>
            Play it
          </button>
          <button type="button" className="ytSubBannerClose" onClick={() => setBanner(false)} aria-label="Dismiss banner">
            ×
          </button>
        </div>
      ) : null}

      <button type="button" className={status === 'unlocked' ? 'ytSubFab is-on' : 'ytSubFab'} onClick={() => setOpen(true)}>
        {status === 'unlocked' ? 'Subscriber VIP' : 'Free song'}
      </button>

      {open ? (
        <div className="ytSubModalScrim" role="dialog" aria-modal="true" aria-labelledby="yt-sub-title" onClick={() => setOpen(false)}>
          <div className="ytSubModal" onClick={(event) => event.stopPropagation()}>
            {status === 'unlocked' ? (
              <>
                <p className="vipKicker">Subscriber welcome</p>
                <h2 id="yt-sub-title">You made the cut.</h2>
                <p>Thanks for riding with @3000Studio. Hit play on your subscriber drop.</p>
                <div className="heroActions">
                  <button type="button" className="studioButton" onClick={playDrop}>
                    Play {FREE_TRACK.title}
                  </button>
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
                <p className="vipKicker">Official subscriber perk</p>
                <h2 id="yt-sub-title">Subscribe. Unlock a free drop.</h2>
                <ol className="ytSubSteps">
                  <li>Subscribe to the official 3000 Studios channel.</li>
                  <li>{canVerify ? 'Come back and verify with the same Google account.' : 'Come back and unlock the perk on this device.'}</li>
                  <li>Play the free song and keep the VIP banner.</li>
                </ol>
                {status === 'need-sub' ? (
                  <p className="ytSubWarn">That Google account is not subscribed to UCTQnEFZUIutrFuDlxGj9cDA yet.</p>
                ) : null}
                {error ? <p className="ytSubWarn">{error}</p> : null}
                <div className="heroActions">
                  <a className="studioButton ytCta" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer" onClick={markSubscribeClick}>
                    1. Subscribe on YouTube
                  </a>
                  {canVerify ? (
                    <button type="button" className="studioButton secondary" onClick={() => void verifyWithGoogle()} disabled={status === 'checking'}>
                      {status === 'checking' ? 'Checking YouTube…' : '2. Verify with Google'}
                    </button>
                  ) : (
                    <button type="button" className="studioButton secondary" onClick={honorUnlock} disabled={!clickedSub}>
                      2. I subscribed — unlock
                    </button>
                  )}
                  <button type="button" className="studioButton ghost" onClick={() => setOpen(false)}>
                    Not now
                  </button>
                </div>
                {!canVerify ? (
                  <p className="ytSubNote">Live check needs VITE_GOOGLE_CLIENT_ID in Cloudflare Pages. Until that is set, unlock requires the Subscribe click first.</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
