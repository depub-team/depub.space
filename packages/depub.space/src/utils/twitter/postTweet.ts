import axios from 'axios';
import { TwitterAccessToken } from './interfaces';

/* eslint-disable prefer-destructuring */
const NEXT_PUBLIC_OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || '';
/* eslint-enable prefer-destructuring */

if (!NEXT_PUBLIC_OAUTH_URL) {
  throw new Error('Missing OAuth URL');
}

interface TwitterMedia {
  media_id: number;
  media_id_string: string;
  media_key: string;
  size: number;
  expires_after_secs: string;
  image: { image_type: string; w: number; h: number };
}

interface RequestData {
  status: string;
  media_ids?: string;
}

const uploadMedia = async (accessToken: TwitterAccessToken, file: File): Promise<TwitterMedia> => {
  const form = new FormData();

  form.set('file', file);

  const uploadResponse = await axios.post(`${NEXT_PUBLIC_OAUTH_URL}/twitter/upload`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${accessToken.oauth_token}:${accessToken.oauth_token_secret}`,
    },
  });

  return uploadResponse.data;
};

export const postTweet = async (
  accessToken: TwitterAccessToken,
  content: string,
  file?: File
): Promise<string> => {
  let uploadedMedia: TwitterMedia | undefined;

  if (file) {
    uploadedMedia = await uploadMedia(accessToken, file);
  }

  const requestData: RequestData = { status: content };

  if (uploadedMedia) {
    requestData.media_ids = uploadedMedia.media_id_string;
  }

  const response = await axios.post(`${NEXT_PUBLIC_OAUTH_URL}/twitter/tweets`, requestData, {
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${accessToken.oauth_token}:${accessToken.oauth_token_secret}`,
    },
  });

  return `https://twitter.com/anyone/status/${response.data.id_str}`;
};
