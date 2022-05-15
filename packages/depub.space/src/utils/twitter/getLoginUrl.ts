import axios from 'axios';

/* eslint-disable prefer-destructuring */
const NEXT_PUBLIC_OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || '';
/* eslint-enable prefer-destructuring */

if (!NEXT_PUBLIC_OAUTH_URL) {
  throw new Error('Missing OAuth URL');
}

export const getLoginUrl = async () => {
  const callbackURL = `${NEXT_PUBLIC_OAUTH_URL}/twitter/callback`;

  const response = await axios({
    url: `${NEXT_PUBLIC_OAUTH_URL}/twitter/request_token`,
    method: 'POST',
    data: {
      redirectURI: callbackURL,
    },
    responseType: 'text',
  });
  // eslint-disable-next-line @typescript-eslint/naming-convention

  return `https://api.twitter.com/oauth/authorize?${response.data}`;
};
