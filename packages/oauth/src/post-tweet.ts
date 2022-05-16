import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { Bindings } from '../bindings';
import { getAuthHeader } from './get-auth-header';
import { getCorsHeaders } from './get-cors-header';

export async function postTweet(request: Request, env: Bindings) {
  const { method } = request;

  if (method !== 'POST') {
    return new Response('Not found', {
      status: 404,
      ...getCorsHeaders(request),
    });
  }

  const requestBody = await request.json<Record<string, string>>();
  const accessTokens = getAuthHeader(request);

  if (!accessTokens) {
    return new Response('Unauthorized', {
      status: 401,
      ...getCorsHeaders(request),
    });
  }

  const requestData = {
    data: requestBody,
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    method: 'POST',
  };
  const oauth = new OAuth({
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
    consumer: {
      key: env.TWITTER_API_KEY,
      secret: env.TWITTER_API_SECRET_KEY,
    },
  });
  const authHeader = oauth.toHeader(oauth.authorize(requestData, accessTokens));
  const response = await fetch('https://api.twitter.com/1.1/statuses/update.json', {
    method: requestData.method,
    headers: {
      ...authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(requestData.data),
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...getCorsHeaders(request),
      ...Object.fromEntries(response.headers.entries()),
    },
  });
}
