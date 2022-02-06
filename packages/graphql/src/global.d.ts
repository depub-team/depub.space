import { KVNamespace } from '@cloudflare/workers-types'

export * from '@cloudflare/workers-types'


declare global {
  const WORKERS_GRAPHQL_CACHE: KVNamespace
  const LIKECOIN_RPC_ENDPOINT: string;
  const ISCN_FINGERPRINT: string;
  const DESMOS_GRAPHQL_ENDPOINT: string;
  const CACHE_TTL: number;
  const ENVIRONMENT: string;
}