import oAuth1a, { encode } from 'twitter-v1-oauth';

import { Bindings } from '../bindings';

interface TwitterAccessToken {
  token_type: string; // bearer
  expires_in: number;
  access_token: string;
  scope: string;
  expires_at: Date;
}

const whitelistOrigins = [
  'http://localhost:3000',
  'https://depub.space',
  'https://stag.depub.space',
];

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin');

  if (!origin || !whitelistOrigins.includes(origin)) {
    return undefined;
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

async function postTwitterTween(request: Request) {
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

function serveHTML() {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Test</title>
  </head>
  <body>
    <form method="POST" action="/oauth/twitter/upload" enctype="multipart/form-data">
      <input type="text" name="user" />
      <input type="file" multiple name="files[]" />
      <input type="submit" />
    </form>
  </body>
</html>
`;

  return new Response(html, { headers: { 'Content-Type': 'html' } });
}

async function uploadMedia(request: Request, env: Bindings) {
  if (request.method !== 'POST') {
    return new Response('Not found', {
      status: 404,
    });
  }

  const oAuthOptions = {
    api_key: env.TWITTER_API_KEY,
    api_secret_key: env.TWITTER_API_SECRET_KEY,
    access_token: env.TWITTER_ACCESS_TOKEN,
    access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET,
  };

  const arrayBuffer = await request.arrayBuffer();
  const requestBody = request.body;
  const base64String = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  // additional_owners = 'user_id,user_id'

  const method = 'POST';
  const url = 'https://upload.twitter.com/1.1/media/upload.json';
  const data = { media_data: base64String };
  const oauth = (oAuth1a as any).default(
    {
      method,
      url,
      data,
    },
    oAuthOptions
  );

  console.log(requestBody, oAuthOptions, oauth);

  const uploadRequest = await fetch(url, {
    method,
    headers: {
      Authorization: oauth,
      'Content-Type': 'multipart/form-data',
    },
    body: encode(data),
  });

  console.log(await uploadRequest.json());

  return new Response('');
}

async function getTwitterOauthToken(request: Request, env: Bindings) {
  const url = new URL(request.url);
  const urlSearchParams = new URLSearchParams(url.search);
  const code = urlSearchParams.get('code');
  const state = urlSearchParams.get('state') || '{}';

  const { clientID, redirectURI, walletAddress } = JSON.parse(decodeURIComponent(state));

  if (!code || !clientID || !redirectURI || !walletAddress) {
    return new Response('Invalid body', {
      status: 403,
    });
  }

  const basicAuth = btoa(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`);

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `code=${code}&grant_type=authorization_code&client_id=${clientID}&redirect_uri=${redirectURI}&code_verifier=challenge`,
  });

  const responseBody = await response.json<TwitterAccessToken>();

  if (response.status !== 200) {
    return new Response(JSON.stringify(responseBody), { status: 500 });
  }

  // save to KV
  const now = Date.now();
  const expiresIn = responseBody.expires_in;
  const twitterAccessTokenWithExpiresAt = JSON.stringify({
    ...responseBody,
    expires_at: new Date(now + expiresIn * 1000),
  });

  return new Response(
    `<script>
  localStorage.setItem('twitterAccessToken', '${btoa(
    JSON.stringify(twitterAccessTokenWithExpiresAt)
  )}');

  window.close();
  </script>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

function handleOptions(request: Request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  const { headers } = request;

  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    const accessControlRequestHeaders = request.headers.get('Access-Control-Request-Headers');
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    const respHeaders = {
      ...getCorsHeaders(request),
      ...(accessControlRequestHeaders
        ? {
            // Allow all future content Request headers to go back to browser
            // such as Authorization (Bearer) or X-Client-Name-Version
            'Access-Control-Allow-Headers': accessControlRequestHeaders,
          }
        : undefined),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  }

  // Handle standard OPTIONS request.
  // If you want to allow other HTTP Methods, you can do that here.
  return new Response(null, {
    headers: {
      ...getCorsHeaders(request),
      Allow: 'GET, HEAD, DELETE, POST, OPTIONS',
    },
  });
}

async function handleRequest(request: Request, env: Bindings) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  try {
    if (pathname === '/oauth/twitter/callback') {
      return await getTwitterOauthToken(request, env);
    }

    if (pathname === '/oauth/twitter/tweets') {
      return await postTwitterTween(request);
    }

    if (pathname === '/oauth/twitter/upload') {
      return await uploadMedia(request, env);
    }

    return serveHTML();

    return new Response('Not found', {
      status: 404,
    });
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);

    return new Response(ex.message, {
      status: 500,
    });
  }
}

export default {
  fetch: (request: Request, env: Bindings) => handleRequest(request, env),
};
