import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { Bindings } from '../bindings';
import { getCorsHeaders } from './get-cors-header';

interface TwitterUploadResponse {
  errors?: { code: number; message: string }[];
  media_id: number;
  media_id_string: string;
  media_key: string;
  size: number;
  expires_after_secs: string;
  image: { image_type: string; w: number; h: number };
}

export async function uploadMedia(request: Request, env: Bindings) {
  if (request.method !== 'POST') {
    return new Response('Not found', {
      status: 404,
    });
  }

  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries()) as {
      oauth_token?: string;
      oauth_token_secret?: string;
    };

    if (!body.oauth_token || !body.oauth_token_secret) {
      return new Response('Invalid body', {
        status: 403,
        headers: getCorsHeaders(request),
      });
    }

    const file = formData.get('file');
    const token = {
      key: env.TWITTER_ACCESS_TOKEN,
      secret: env.TWITTER_ACCESS_TOKEN_SECRET,
    };

    const fileArrayBuffer = await (file as Blob).arrayBuffer();
    const base64String = btoa(
      new Uint8Array(fileArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const requestData: OAuth.RequestOptions = {
      url: 'https://upload.twitter.com/1.1/media/upload.json',
      method: 'POST',
      data: { media_data: base64String, media_category: 'tweet_image' },
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
    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    const uploadResponse = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestData.data),
    });

    if (uploadResponse.status !== 200) {
      const responseBody = await uploadResponse.text();
      const errors = responseBody || 'Twitter API returned non-200 status code for Media';

      return new Response(errors, {
        status: 500,
        headers: getCorsHeaders(request),
      });
    }

    const responseBody = await uploadResponse.json<TwitterUploadResponse>();

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return new Response('Bad Request', { status: 500, headers: getCorsHeaders(request) });
  }
}
