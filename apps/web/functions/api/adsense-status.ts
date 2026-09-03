export const onRequestGet: PagesFunction = async () => {
  const adsTxt = 'google.com, pub-5800977493749262, DIRECT, f08c47fec0942fa0';
  const slot = (globalThis as { ADSENSE_HOME_SLOT?: string }).ADSENSE_HOME_SLOT || '';
  const body = {
    ok: true,
    publisher: 'ca-pub-5800977493749262',
    adsTxtExpected: adsTxt,
    homeSlotConfigured: Boolean(slot),
    notes: [
      'ads.txt is live at https://3000studios.vip/ads.txt',
      'pagead script and google-adsense-account meta are in index.html',
      slot ? 'Home ad slot env is set' : 'VITE_ADSENSE_HOME_SLOT is empty — no display units render. Create an ad unit in AdSense and set the slot on Cloudflare Pages.',
      'Same publisher ID is used on myappai.net. That is valid if both sites sit on one AdSense account.',
      'Approval needs real content, ads.txt, privacy policy, and at least one ad unit. Empty slot = nothing for Google to fill.',
    ],
    checklist: { adsTxt: true, privacyPolicy: true, scriptTag: true, displaySlot: Boolean(slot) },
  };
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
