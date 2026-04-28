const probeEndpoints = [
  '/api/public/site',
  '/api/public/events',
  '/api/public/leads',
  '/api/public/previews',
  '/api/public/checkout/stripe',
  '/api/public/checkout/paypal',
  '/api/public/customer/access',
  '/api/public/customer/session',
] as const;

const adSelectors = ['[data-ads-lock]', '.adsense-wrap'] as const;

type InspectResult = {
  pageStatus: number | null;
  assetUrl: string | null;
  config: Record<string, unknown> | null;
  endpointStatus: Record<string, number | string>;
  selectorStatus: Record<string, boolean | string>;
  htmlDetectedBridge: boolean;
  error?: string;
};

export async function inspectBridge(origin: string): Promise<InspectResult> {
  try {
    const pageRes = await fetch(origin, { redirect: 'follow' });
    const html = await pageRes.text();
    const htmlDetectedBridge = html.includes('studio-ops-bridge') || html.includes('__VTW_SITE_BRIDGE__');

    const scriptMatch = html.match(/<script[^>]+src="([^"]+index-[^"]+\.js)"/i);
    const assetUrl = scriptMatch ? new URL(scriptMatch[1], origin).toString() : null;
    let bundle = '';
    if (assetUrl) {
      const assetRes = await fetch(assetUrl);
      bundle = await assetRes.text();
    }

    const config = parseBridgeConfig(bundle, html);
    const endpointStatus = await probeBridgeEndpoints(origin);
    const selectorStatus = detectSelectors(html, bundle);

    return {
      pageStatus: pageRes.status,
      assetUrl,
      config,
      endpointStatus,
      selectorStatus,
      htmlDetectedBridge,
    };
  } catch (error) {
    return {
      pageStatus: null,
      assetUrl: null,
      config: null,
      endpointStatus: {},
      selectorStatus: {},
      htmlDetectedBridge: false,
      error: error instanceof Error ? error.message : 'bridge_inspect_failed',
    };
  }
}

async function probeBridgeEndpoints(origin: string): Promise<Record<string, number | string>> {
  const out: Record<string, number | string> = {};
  await Promise.all(
    probeEndpoints.map(async (path) => {
      try {
        const res = await fetch(new URL(path, origin).toString(), {
          method: 'GET',
          redirect: 'manual',
        });
        out[path] = res.status;
      } catch (error) {
        out[path] = error instanceof Error ? error.message : 'fetch_failed';
      }
    }),
  );
  return out;
}

function detectSelectors(html: string, bundle: string): Record<string, boolean | string> {
  const out: Record<string, boolean | string> = {};
  for (const selector of adSelectors) {
    out[selector] = html.includes(selector) || bundle.includes(selector);
  }
  return out;
}

function parseBridgeConfig(bundle: string, html: string): Record<string, unknown> | null {
  if (!bundle && !html) return null;

  const siteMatch = bundle.match(/site:`([^`]+)`/);
  const originMatch = bundle.match(/origin:`([^`]+)`/);
  const ingestMatch = bundle.match(/monitorEndpoint:`([^`]+)`/);
  const adsenseClientId =
    bundle.match(/ca-pub-[0-9]+/)?.[0] ??
    html.match(/ca-pub-[0-9]+/)?.[0] ??
    null;
  const adsenseScriptPresent =
    bundle.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') ||
    html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  const adsenseSlotSignals =
    Number(html.includes('adsbygoogle')) +
    Number(bundle.includes('adsbygoogle')) +
    Number(html.includes('data-ads-lock')) +
    Number(bundle.includes('data-ads-lock'));

  const config = {
    site: siteMatch?.[1] ?? null,
    origin: originMatch?.[1] ?? null,
    monitorEndpoint: ingestMatch?.[1] ?? null,
    endpoints: {
      snapshot: '/api/public/site',
      events: '/api/public/events',
      leads: '/api/public/leads',
      previews: '/api/public/previews',
      stripe: '/api/public/checkout/stripe',
      paypal: '/api/public/checkout/paypal',
      customerAccess: '/api/public/customer/access',
      customerSession: '/api/public/customer/session',
    },
    editSurfaces: ['/dashboard', '/admin', '/products', '/pricing', '/blog', '/contact'],
    adSelectors: [...adSelectors],
    adsense: {
      clientId: adsenseClientId,
      scriptPresent: adsenseScriptPresent,
      slotSignals: adsenseSlotSignals,
    },
  };

  return config;
}

