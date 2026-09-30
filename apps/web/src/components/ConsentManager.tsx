import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { adsenseClientId } from '../lib/adsense';

const CONSENT_KEY = '3000-consent-v1';

type Consent = {
  analytics: boolean;
  ads: boolean;
  timestamp: number;
};

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* ignore */
  }
}

/**
 * Fired on `window` whenever the stored consent choice changes. Ad units
 * subscribe to this so they can render (and push their adsbygoogle request)
 * when a visitor accepts *after* the unit already mounted — an imperative
 * localStorage read at render time misses that transition, which previously
 * meant ads never loaded in the session consent was granted.
 */
export const CONSENT_CHANGED_EVENT = '3000-consent-changed';

function notifyConsentChanged() {
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

function loadScript(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
  document.head.appendChild(script);
}

function updateGtagConsent(consent: Consent) {
  if (typeof window === 'undefined' || !('gtag' in window)) return;
  const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
  gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.ads ? 'granted' : 'denied',
    ad_user_data: consent.ads ? 'granted' : 'denied',
    ad_personalization: consent.ads ? 'granted' : 'denied',
  });
}

function loadAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.toString().trim() || 'G-DH1WBK8YWK';
  if (!measurementId) return;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  const existing = document.querySelector('script[data-3000-ga-config]');
  if (existing) return;
  const script = document.createElement('script');
  script.dataset.threeThousandGaConfig = 'true';
  script.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script);
}

function loadAdsense() {
  const clientId = adsenseClientId();
  if (!clientId) return;
  loadScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
    'data-ad-client': clientId,
    crossorigin: 'anonymous',
  });
}

function applyConsent(consent: Consent) {
  updateGtagConsent(consent);
  if (consent.analytics) loadAnalytics();
  if (consent.ads) loadAdsense();
}

export function ConsentManager() {
  const [consent, setConsent] = useState<Consent | null>(readConsent);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    if (consent) {
      applyConsent(consent);
      return;
    }
    // Wait briefly so the page paint isn't blocked by the banner.
    const id = window.setTimeout(() => setBannerOpen(true), 600);
    return () => window.clearTimeout(id);
  }, [consent]);

  const choose = (analytics: boolean, ads: boolean) => {
    const next: Consent = { analytics, ads, timestamp: Date.now() };
    writeConsent(next);
    setConsent(next);
    setBannerOpen(false);
    // Wake up any already-mounted ad units so they render and push their
    // adsbygoogle request now, not only on the next page load.
    notifyConsentChanged();
    applyConsent(next);
  };

  if (!bannerOpen) return null;

  return createPortal(
    <div
      className="consentBanner"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie and advertising consent"
    >
      <div className="consentBannerBody">
        <p>
          <strong>3000 Studios VIP</strong> uses cookies for site analytics and, where available, to
          serve ads. Your choice is stored in this browser.
        </p>
        <div className="consentBannerActions">
          <button type="button" className="cBtn primary" onClick={() => choose(true, true)}>
            Accept all
          </button>
          <button type="button" className="cBtn ghost" onClick={() => choose(true, false)}>
            Analytics only
          </button>
          <button type="button" className="cBtn ghost" onClick={() => choose(false, false)}>
            Reject all
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('consent-banner') ?? document.body,
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConsent() {
  return readConsent();
}

/**
 * Reactive ads-consent flag for ad units. True only after the visitor accepted
 * ads; re-renders the caller when the stored choice changes so units mounted
 * before consent can render their <ins> and push their ad request.
 */
export function useAdConsent(): boolean {
  const [ads, setAds] = useState(() => readConsent()?.ads === true);
  useEffect(() => {
    const onChange = () => setAds(readConsent()?.ads === true);
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, []);
  return ads;
}
