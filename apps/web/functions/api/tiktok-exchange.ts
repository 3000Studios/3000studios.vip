export const onRequestPost: PagesFunction = async ({ request }) => {
  return fetch('https://apex-citadel-api.mr-jwswain.workers.dev/tiktok/oauth/exchange', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: request.body,
  });
};
