import { getDailyBlogPosts } from '../../apps/web/src/data/blog';

export const onRequestGet: PagesFunction = async () => {
  const posts = getDailyBlogPosts(new Date());
  return new Response(JSON.stringify({ ok: true, intervalHours: 6, generatedAt: new Date().toISOString(), posts }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
};
