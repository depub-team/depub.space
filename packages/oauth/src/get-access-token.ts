import { Bindings } from '../bindings';

const TWITTER_ACCESS_TOKEN_STORAGE_KEY = 'TWITTER_ACCESS_TOKEN';

interface TwitterAccessToken {
  oauth_token: string;
  oauth_token_secret: string;
  user_id: string;
  screen_name: string;
}

export async function getTwitterAccessToken(request: Request, env: Bindings) {
  const url = new URL(request.url);
  const urlSearchParams = new URLSearchParams(url.search);
  const oauthToken = urlSearchParams.get('oauth_token');
  const oauthVerifier = urlSearchParams.get('oauth_verifier');

  if (!oauthToken || !oauthVerifier) {
    return new Response('Invalid body', {
      status: 403,
    });
  }

  const params = new URLSearchParams();

  params.append('oauth_token', oauthToken);
  params.append('oauth_verifier', oauthVerifier);
  params.append('oauth_consumer_key', env.TWITTER_API_KEY);

  const response = await fetch(`https://api.twitter.com/oauth/access_token?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });

  const responseBody = await response.text();
  const twitterAccessTokens = Object.fromEntries(
    new URLSearchParams(responseBody).entries()
  ) as unknown as TwitterAccessToken;

  if (response.status !== 200) {
    return new Response(JSON.stringify(responseBody), { status: 500 });
  }

  return new Response(
    `<script>
  localStorage.setItem('${TWITTER_ACCESS_TOKEN_STORAGE_KEY}', '${btoa(
      JSON.stringify(twitterAccessTokens)
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
