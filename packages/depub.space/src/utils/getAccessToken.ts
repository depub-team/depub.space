import axios from 'axios';

export const getAccessToken = async (authSignatureAndPublicKey: string, prefix: string) => {
  const response = await axios.post(
    'https://auth.depub.space',
    {
      prefix,
    },
    {
      headers: {
        Authorization: `Bearer ${authSignatureAndPublicKey}`,
      },
    }
  );

  return response.data.accessToken;
};
