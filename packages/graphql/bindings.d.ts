export {}

export interface Bindings {
  ISCN_TXN: DurableObjectNamespace;
  USER_PROFILE: DurableObjectNamespace;
  WORKERS_GRAPHQL_CACHE: KVNamespace;
  NFT_CONTRACTS_CACHE: KVNamespace;
  NODE_URL: string;
  ISCN_FINGERPRINT: string;
  DESMOS_GRAPHQL_ENDPOINT: string;
  CACHE_TTL: number;
  ENVIRONMENT: string;
  AUTH_TOKEN: string;
  STARGAZE_REST_ENDPOINT: string;
  JWT_SECRET: string;
}