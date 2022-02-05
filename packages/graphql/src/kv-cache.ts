export default class KVCache {
  get(key: string): Promise<string> {
    return WORKERS_GRAPHQL_CACHE.get(key, {
      cacheTtl: CACHE_TTL,
    });
  }

  set(key: string, value: string, options?: any): Promise<void> {
    const opts: any = {};
    const ttl = (options && options.ttl) || CACHE_TTL;

    opts.expirationTtl = ttl;

    return WORKERS_GRAPHQL_CACHE.put(key, value, {
      ttl: CACHE_TTL,
    });
  }

  delete(key: string): Promise<boolean | void> {
    return WORKERS_GRAPHQL_CACHE.delete(key);
  }
}
