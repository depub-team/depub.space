import { ApolloServer } from 'apollo-server-cloudflare';
import { graphqlCloudflare } from 'apollo-server-cloudflare/dist/cloudflareApollo';
import { typeDefs } from '../schema';
import { resolvers } from '../resolvers';
import { DesmosAPI, ISCNQueryAPI } from '../datasources';
import { context } from '../context';
import KVCache from '../kv-cache';
import { GqlHandlerOptions } from './handler.types';

const kvCache = { cache: new KVCache() };

const createServer = (graphQLOptions: GqlHandlerOptions): ApolloServer =>
  new ApolloServer({
    typeDefs,
    introspection: true,
    resolvers,
    dataSources: () => ({
      iscnQueryAPI: new ISCNQueryAPI(`${NODE_URL}rpc/`),
      desmosAPI: new DesmosAPI(DESMOS_GRAPHQL_ENDPOINT),
    }),
    ...(graphQLOptions.kvCache ? kvCache : {}),
    context,
    ...graphQLOptions,
  });

export const handler = async (request: Request, graphQLOptions: GqlHandlerOptions) => {
  const server = createServer(graphQLOptions);

  await server.start();

  // eslint-disable-next-line no-console
  console.info('CREATED SERVER');

  return graphqlCloudflare(() => server.createGraphQLServerOptions(request as any))(request as any);
};
