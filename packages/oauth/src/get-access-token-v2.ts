import { Bindings } from '../bindings';

const TWITTER_ACCESS_TOKEN_STORAGE_KEY = 'TWITTER_ACCESS_TOKEN_STORAGE_KEY';

// XXX: unused function, but keep it in case we need it in the future

interface TwitterAccessToken {
  token_type: string; // bearer
  expires_in: number;
  access_token: string;
  scope: string;
  expires_at: Date;
}

export async function getTwitterAccessTokenV2(request: Request, env: Bindings) {
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

  // save to localstorage
  const now = Date.now();
  const expiresIn = responseBody.expires_in;
  const twitterAccessTokenWithExpiresAt = {
    ...responseBody,
    expires_at: new Date(now + expiresIn * 1000),
  };

  return new Response(
    `<script>
  localStorage.setItem('${TWITTER_ACCESS_TOKEN_STORAGE_KEY}', '${btoa(
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
