/* eslint-disable prefer-destructuring */
const NEXT_PUBLIC_TWITTER_CLIENT_ID = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
const NEXT_PUBLIC_OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || '';
/* eslint-enable prefer-destructuring */

if (!NEXT_PUBLIC_TWITTER_CLIENT_ID || !NEXT_PUBLIC_APP_URL || !NEXT_PUBLIC_OAUTH_URL) {
  throw new Error('Missing Twitter client ID or app URL or OAuth URL');
}

export const getLoginUrl = (walletAddress: string) => {
  const callbackURL = `${NEXT_PUBLIC_OAUTH_URL}/twitter/callback`;
  const urlSearchParams = new URLSearchParams();
  const scope = ['tweet.read', 'tweet.write', 'users.read', 'follows.read', 'follows.write'].join(
    ' '
  );
  const state = encodeURIComponent(
    JSON.stringify({
      clientID: NEXT_PUBLIC_TWITTER_CLIENT_ID,
      redirectURI: callbackURL,
      walletAddress,
    })
  );

  urlSearchParams.append('response_type', 'code');
  urlSearchParams.append('client_id', NEXT_PUBLIC_TWITTER_CLIENT_ID);
  urlSearchParams.append('redirect_uri', callbackURL);
  urlSearchParams.append('scope', scope);
  urlSearchParams.append('state', state);
  urlSearchParams.append('code_challenge', 'challenge');
  urlSearchParams.append('code_challenge_method', 'plain');

  return `https://twitter.com/i/oauth2/authorize?${urlSearchParams.toString()}`;
};
