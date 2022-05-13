import { Bindings } from '../bindings';
import { getTwitterAccessTokenV2 } from './get-access-token-v2';
import { postTweetV2 } from './post-tweet-v2';
import { handleOptions } from './get-cors-header';
import { uploadMedia } from './upload-media';
import { getTwitterOAuthToken } from './get-oauth-token';
import { getTwitterAccessToken } from './get-access-token';

function serveHTML() {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Test</title>
  </head>
  <body>
    <form method="POST" action="/oauth/twitter/upload" enctype="multipart/form-data">
      <input type="hidden" name="additional_owners" />
      <input type="file" multiple name="file" />
      <input name="oauth_token" type="hidden" value="68345395-fVCmtxrqLxDR04AEIoXg7xwFCMAJ901gCMoFqtBJW" />
      <input name="oauth_token_secret" type="hidden" value="n15SLJK5cfwfZpPYbx8NEVFqJGldq4jrfQmyuTAteifJr" />
      <input type="submit" />
    </form>
  </body>
</html>
`;

  return new Response(html, { headers: { 'Content-Type': 'html' } });
}

async function handleRequest(request: Request, env: Bindings) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  try {
    if (pathname === '/oauth/twitter/request_token') {
      return await getTwitterOAuthToken(request, env);
    }

    if (pathname === '/oauth/twitter/callback') {
      return await getTwitterAccessToken(request, env);
    }

    if (pathname === '/oauth/twitter/v2/callback') {
      return await getTwitterAccessTokenV2(request, env);
    }

    if (pathname === '/oauth/twitter/v2/tweets') {
      return await postTweetV2(request);
    }

    if (pathname === '/oauth/twitter/upload') {
      return await uploadMedia(request, env);
    }

    return serveHTML();

    return new Response('Not found', {
      status: 404,
    });
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);

    return new Response(ex.message, {
      status: 500,
    });
  }
}

export default {
  fetch: (request: Request, env: Bindings) => handleRequest(request, env),
};
