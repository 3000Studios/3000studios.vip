import type { PagesEnv } from '../env';

export const onRequestGet: PagesFunction<PagesEnv> = async ({ env }) => {
  const publisher = (env.VITE_ADSENSE_CLIENT_ID as string | undefined)?.trim() || '';
  const adsTxt = publisher
    ? `google.com, ${publisher.replace('ca-pub-', 'pub-')}, DIRECT, f08c47fec0942fa0`
    : '';
  const slotEnvs = [
    'VITE_ADSENSE_HOME_SLOT',
    'VITE_ADSENSE_VIDEO_SLOT',
    'VITE_ADSENSE_LIVE_SLOT',
    'VITE_ADSENSE_BLOG_SLOT',
  ] as const;
  const slots = Object.fromEntries(
    slotEnvs.map((name) => [name, ((env[name] as string | undefined)?.trim() || '')]),
  ) as Record<(typeof slotEnvs)[number], string>;
  const missingSlots = slotEnvs.filter((name) => !slots[name]);
  const homeSlot = slots.VITE_ADSENSE_HOME_SLOT;
  const body = {
    ok: true,
    publisher,
    adsTxtExpected: adsTxt,
    homeSlotConfigured: Boolean(homeSlot),
    slots,
    missingSlots,
    notes: [
      'ads.txt is live at https://3000studios.vip/ads.txt',
      'google-adsense-account meta is in index.html; pagead script loads once, only after the visitor accepts ads (ConsentManager)',
      ...slotEnvs.map((name) =>
        slots[name]
          ? `${name} is set`
          : `${name} is empty — that page's display unit renders nothing. Create an ad unit in AdSense (Ads > By ad unit) and set the slot on Cloudflare Pages, then redeploy.`,
      ),
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
      allSlotsConfigured: missingSlots.length === 0,
    },
  };
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
