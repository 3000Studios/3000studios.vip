export const onRequestGet: PagesFunction = async () => {
  const slot = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
  const titles = [
    '3000 Studios Live Window Stays Ready',
    'Shop And Vault Plans Are Live',
    'Discover Cards Run Official Videos',
    'Atlanta Creator Stack: Music, Live, Games',
  ];
  const posts = titles.map((title, i) => ({
    id: `slot-${slot}-${i}`,
    title,
    summary: 'Auto studio desk update. Mix rotates every six hours.',
    date: new Date((slot - i) * 6 * 60 * 60 * 1000).toISOString(),
    category: i % 2 ? 'seo' : 'update',
  }));
  return new Response(JSON.stringify({ ok: true, intervalHours: 6, generatedAt: new Date().toISOString(), posts }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
};
