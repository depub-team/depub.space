import axios from 'axios';
import { TwitterAccessToken } from './interfaces';

/* eslint-disable prefer-destructuring */
const NEXT_PUBLIC_OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || '';
/* eslint-enable prefer-destructuring */

if (!NEXT_PUBLIC_OAUTH_URL) {
  throw new Error('Missing OAuth URL');
}

export const getAccessTokenByWalletAddress = async (
  walletAddress: string
): Promise<TwitterAccessToken | null> => {
  try {
    const response = await axios.get(`${NEXT_PUBLIC_OAUTH_URL}/twitter/${walletAddress}`);

    if (response.status === 200) {
      return response.data;
    }
  } catch {
    // do nothing
  }

  return null;
};
