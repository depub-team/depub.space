import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { Bindings } from '../bindings';
import { getAuthHeader } from './get-auth-header';
import { getCorsHeaders } from './get-cors-header';

interface RequestPayload {
  media_data: string;
  media_category: string;
  additional_owners?: string;
}

export async function uploadMedia(request: Request, env: Bindings) {
  if (request.method !== 'POST') {
    return new Response('Not found', {
      status: 404,
    });
  }

  try {
    const formData = await request.formData();
    const accessTokens = getAuthHeader(request);

    if (!accessTokens) {
      return new Response('Unauthorized', {
        status: 401,
        headers: getCorsHeaders(request),
      });
    }

    if (!formData.has('file')) {
      return new Response('Invalid body', {
        status: 403,
        headers: getCorsHeaders(request),
      });
    }

    const file = formData.get('file');
    // app key
    // const token: OAuth.Token = {
    //   key: env.TWITTER_ACCESS_TOKEN,
    //   secret: env.TWITTER_ACCESS_TOKEN_SECRET,
    // };

    const fileArrayBuffer = await (file as Blob).arrayBuffer();
    const base64String = btoa(
      new Uint8Array(fileArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const data: RequestPayload = { media_data: base64String, media_category: 'tweet_image' };

    if (formData.has('additional_owners')) {
      data.additional_owners = formData.get('additional_owners') as string;
    }

    const requestData: OAuth.RequestOptions = {
      url: 'https://upload.twitter.com/1.1/media/upload.json',
      method: 'POST',
      data,
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

    const uploadResponse = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestData.data),
    });

    return new Response(uploadResponse.body, {
      status: uploadResponse.status,
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return new Response('Bad Request', { status: 500, headers: getCorsHeaders(request) });
  }
}
