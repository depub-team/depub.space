import axios from 'axios';
import Debug from 'debug';

const debug = Debug('web:twitter/getLoginUrl');

/* eslint-disable prefer-destructuring */
const NEXT_PUBLIC_OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || '';
/* eslint-enable prefer-destructuring */

if (!NEXT_PUBLIC_OAUTH_URL) {
  throw new Error('Missing OAuth URL');
}

export const getLoginUrl = async () => {
  debug('getLoginUrl()');

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

  debug('getLoginUrl() -> response', response);

  return `https://api.twitter.com/oauth/authorize?${response.data}`;
};
