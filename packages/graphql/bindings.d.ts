export {}

declare global {
  const WORKERS_GRAPHQL_CACHE: KVNamespace;
  const ISCN_TXN: DurableObjectNamespace;
  const NODE_URL: string;
  const ISCN_FINGERPRINT: string;
  const DESMOS_GRAPHQL_ENDPOINT: string;
  const CACHE_TTL: number;
  const ENVIRONMENT: string;
  const AUTH_TOKEN: string;
}

export interface Bindings {
  ISCN_TXN: DurableObjectNamespace;
  WORKERS_GRAPHQL_CACHE: KVNamespace;
}