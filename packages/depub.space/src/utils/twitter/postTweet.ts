import axios from 'axios';
import { TwitterAccessToken } from './interfaces';

/* eslint-disable prefer-destructuring */
const NEXT_PUBLIC_OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || '';
/* eslint-enable prefer-destructuring */

if (!NEXT_PUBLIC_OAUTH_URL) {
  throw new Error('Missing OAuth URL');
}

export const postTweet = async (
  accessToken: TwitterAccessToken,
  text: string
): Promise<string | undefined> => {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_OAUTH_URL}/twitter/tweets`,
      { text },
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken.access_token}`,
        },
      }
    );

    if (response.status === 200) {
      return `https://twitter.com/anyone/status/${response.data.data.id}`;
    }
  } catch {
    // do nothing
  }

  return undefined;
};
