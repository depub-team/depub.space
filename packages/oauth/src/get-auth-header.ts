export const getAuthHeader = (request: Request): OAuth.Token | null => {
  const auth = request.headers.get('Authorization');
  const bearerToken = auth?.replace('Bearer ', '');
  const accessTokens = bearerToken?.split(':');

  return accessTokens
    ? {
        key: accessTokens?.[0],
        secret: accessTokens?.[1],
      }
    : null;
};
