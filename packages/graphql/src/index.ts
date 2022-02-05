import CloudflareWorkerGlobalScope from 'types-cloudflare-worker';

import { apollo, playground } from './handlers';
import { setCorsHeaders as setCors } from './utils';

const graphQLOptions = {
  baseEndpoint: '/',
  playgroundEndpoint: '/playground',
  cors: true,
  forwardUnmatchedRequestsToOrigin: false,
  debug: process.env.NODE_ENV === 'development',
  kvCache: false,
};

const handleRequest = async (request: Request) => {
  const url = new URL(request.url);

  try {
    if (url.pathname === graphQLOptions.baseEndpoint) {
      const response =
        request.method === 'OPTIONS'
          ? new Response('', { status: 204 })
          : await apollo(request, graphQLOptions);

      if (graphQLOptions.cors) {
        setCors(response, graphQLOptions.cors);
      }

      return response;
    }

    if (graphQLOptions.playgroundEndpoint && url.pathname === graphQLOptions.playgroundEndpoint) {
      return playground(request, graphQLOptions);
    }

    if (graphQLOptions.forwardUnmatchedRequestsToOrigin) {
      return await fetch(request);
    }

    return new Response('Not found', { status: 404 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ERROR ?', err);

    return new Response(graphQLOptions.debug ? (err as any) : 'Something went wrong', {
      status: 500,
    });
  }
};

declare let self: CloudflareWorkerGlobalScope;

self.addEventListener('fetch', (event: { request: Request; respondWith: any }) => {
  event.respondWith(handleRequest(event.request));
});
