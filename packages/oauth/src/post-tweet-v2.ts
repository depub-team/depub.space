import { getCorsHeaders } from './get-cors-header';

// XXX: unused function, but keep it in case we need it in the future

export async function postTweetV2(request: Request) {
  const { method } = request;

  if (method !== 'POST') {
    return new Response('Not found', {
      status: 404,
    });
  }

  const body = await request.json();
  const auth = request.headers.get('Authorization');
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(auth
        ? {
            Authorization: auth,
          }
        : undefined),
    },
    body: JSON.stringify(body),
  });

  return new Response(response.body, {
    headers: {
      ...getCorsHeaders(request),
      ...Object.fromEntries(response.headers.entries()),
    },
  });
}
