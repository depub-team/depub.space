import { ApolloServer } from 'apollo-server-cloudflare';
import { graphqlCloudflare } from 'apollo-server-cloudflare/dist/cloudflareApollo';
import { typeDefs } from '../schema';
import { resolvers } from '../resolvers';
import { DesmosAPI, ISCNQueryAPI } from '../datasources';
import { GqlHandlerOptions } from './handler.types';

const createServer = (graphQLOptions: GqlHandlerOptions): ApolloServer => {
  const context = graphQLOptions.context ? graphQLOptions.context() : {};
  const { env } = context;

  return new ApolloServer({
    typeDefs,
    introspection: true,
    resolvers,
    dataSources: () => ({
      iscnQueryAPI: new ISCNQueryAPI(`${env.NODE_URL}rpc/`),
      desmosAPI: new DesmosAPI(env.DESMOS_GRAPHQL_ENDPOINT),
    }),
    ...graphQLOptions,
  });
};

export const handler = async (request: Request, graphQLOptions: GqlHandlerOptions) => {
  const server = createServer(graphQLOptions);

  await server.start();

  // eslint-disable-next-line no-console
  console.info('CREATED SERVER');

  return graphqlCloudflare(() => server.createGraphQLServerOptions(request as any))(request as any);
};
