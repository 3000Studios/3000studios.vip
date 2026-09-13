export const onRequestPost: PagesFunction = async ({ request }) => {
  return fetch('https://apex-citadel-api.mr-jwswain.workers.dev/tiktok/upload-draft', {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') || 'video/mp4',
      'x-tiktok-session': request.headers.get('x-tiktok-session') || '',
    },
    body: request.body,
  });
};
