import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  OFFICIAL_YOUTUBE_CHANNEL_ID,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from '../data/officialReleases';

const SUBSCRIBE_URL = `https://www.youtube.com/channel/${OFFICIAL_YOUTUBE_CHANNEL_ID}?sub_confirmation=1`;

/** No auto-open modal. No top banner. Corner button only. */
export function YouTubeSubscriberPerk() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith('/admin') || pathname.startsWith('/live') || pathname.startsWith('/shop')) {
    return null;
  }
  return (
    <>
      <button type="button" className="ytSubFab ytPerkSafe" onClick={() => setOpen(true)}>
        Subscribe
      </button>
      {open ? (
        <div className="ytSubModalScrim" role="dialog" aria-modal="true">
          <div className="ytSubModal">
            <p className="vipKicker">@3000Studio</p>
            <h2>Subscribe on YouTube</h2>
            <p>Official DistroKid videos live on the channel. This box never covers the page until you tap Subscribe.</p>
            <div className="heroActions">
              <a className="studioButton ytCta ytPerkSafe" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                Subscribe on YouTube
              </a>
              <a className="studioButton secondary ytPerkSafe" href={OFFICIAL_YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer">
                Open channel
              </a>
              <button type="button" className="studioButton ghost ytPerkSafe" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
