import { Bindings } from '../bindings';
import { NotionAPI } from './datasources';
import { apollo, playground } from './handlers';
import { GqlHandlerOptions } from './handlers/handler.types';
import { setCorsHeaders as setCors } from './utils';

export { IscnTxn, UserProfile } from './durable-objects';

const clearListCache = async (env: Bindings) => {
  const LIST_KEY = 'list';
  const notionAPI = new NotionAPI(env.NOTION_API_ENDPOINT, env.NOTION_API_SECRET);
  const databases = await notionAPI.getDatabases();
  const databaseKeys = Object.keys(databases || {});

  if (!databases) {
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const databaseKey of databaseKeys) {
    const databaseIdByCountryCode = databases[databaseKey];
    const CACHE_KEY = `${LIST_KEY}_${databaseKey}`;

    if (!databaseIdByCountryCode) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const list = await notionAPI.getList(databaseIdByCountryCode);

    // put records into kv cache
    // eslint-disable-next-line no-await-in-loop
    await env.WORKERS_GRAPHQL_CACHE.put(CACHE_KEY, JSON.stringify(list));
  }
};

const graphQLOptions: GqlHandlerOptions = {
  baseEndpoint: '/',
  playgroundEndpoint: '/playground',
  cors: true,
  forwardUnmatchedRequestsToOrigin: false,
  debug: process.env.NODE_ENV === 'development',
  kvCache: false,
};

const handleRequest = async (request: Request, env: Bindings) => {
  const url = new URL(request.url);
  const isDev = env.ENVIRONMENT !== 'production';
  const referer = request.headers.get('referer');
  const refererUrl = referer && new URL(referer);

  try {
    // Authentication with signed message
    const authHeader = request.headers.get('authorization');
    let accessToken = '';

    if (authHeader) {
      [, accessToken] = authHeader.split('Bearer ');
    }

    if (url.pathname === graphQLOptions.baseEndpoint) {
      const response =
        request.method === 'OPTIONS'
          ? new Response('', { status: 204 })
          : await apollo(request, {
              ...graphQLOptions,
              context: () => ({
                env,
                accessToken,
              }),
            });

      // CORS
      if (graphQLOptions.cors) {
        let allowOrigin = '*';

        if (refererUrl) {
          // development only
          if (isDev && refererUrl.hostname === 'localhost') {
            allowOrigin = refererUrl.origin;
          } else if (refererUrl.hostname.endsWith('depub.space')) {
            allowOrigin = refererUrl.origin;
          }
        }

        setCors(response, {
          allowOrigin,
          allowCredentials: 'true',
          allowHeaders: '*',
          allowMethods: 'GET, POST',
        });
      }

      return response;
    }

    if (url.pathname === '/clear-list-cache') {
      await clearListCache(env);

      return new Response('', { status: 204 });
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

export default {
  fetch: (request: Request, env: Bindings) => handleRequest(request, env),
};
