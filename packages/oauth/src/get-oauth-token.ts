import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { getCorsHeaders } from './get-cors-header';
import { Bindings } from '../bindings';

export async function getTwitterOAuthToken(request: Request, env: Bindings) {
  if (!request.body) {
    return new Response('Invalid body', {
      status: 403,
      headers: getCorsHeaders(request),
    });
  }

  try {
    const body = await request.json<{ redirectURI?: string }>();
    const { redirectURI } = body;

    if (!redirectURI) {
      return new Response('Invalid body', {
        status: 403,
        headers: getCorsHeaders(request),
      });
    }

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

    const requestData: OAuth.RequestOptions = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: redirectURI },
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    const result = await fetch('https://api.twitter.com/oauth/request_token', {
      method: 'POST',
      body: JSON.stringify({ oauth_callback: redirectURI }),
      headers: {
        ...authHeader,
      },
    });

    const responseText = await result.text();

    if (result.status !== 200) {
      return new Response('Bad request', { status: 500, headers: getCorsHeaders(request) });
    }

    return new Response(JSON.stringify(responseText), {
      headers: {
        'Content-Type': 'plain/text',
        ...getCorsHeaders(request),
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return new Response('Bad request', { status: 500, headers: getCorsHeaders(request) });
  }
}
