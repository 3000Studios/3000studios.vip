import type { PagesEnv } from '../env';

export const onRequestGet: PagesFunction<PagesEnv> = async ({ env }) => {
  const publisher = (env.VITE_ADSENSE_CLIENT_ID as string | undefined)?.trim() || '';
  const adsTxt = publisher
    ? `google.com, ${publisher.replace('ca-pub-', 'pub-')}, DIRECT, f08c47fec0942fa0`
    : '';
  const homeSlot = (env.VITE_ADSENSE_HOME_SLOT as string | undefined)?.trim() || '';
  const body = {
    ok: true,
    publisher,
    adsTxtExpected: adsTxt,
    homeSlotConfigured: Boolean(homeSlot),
    notes: [
      'ads.txt is live at https://3000studios.vip/ads.txt',
      'pagead script and google-adsense-account meta are in index.html',
      homeSlot
        ? 'Home ad slot env is set'
        : 'VITE_ADSENSE_HOME_SLOT is empty — no display units render. Create an ad unit in AdSense and set the slot on Cloudflare Pages.',
      publisher
        ? 'Publisher ID is configured via VITE_ADSENSE_CLIENT_ID.'
        : 'VITE_ADSENSE_CLIENT_ID is empty — AdSense script will not load.',
      'Approval needs real content, ads.txt, privacy policy, and at least one ad unit. Empty slot = nothing for Google to fill.',
    ],
    checklist: {
      adsTxt: Boolean(publisher),
      privacyPolicy: true,
      scriptTag: Boolean(publisher),
      displaySlot: Boolean(homeSlot),
    },
  };
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
