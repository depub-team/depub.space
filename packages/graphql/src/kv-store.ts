// kv wrapper
export class KVStore {
  constructor(public kv: KVNamespace) {}

  list<Metadata = { [key: string]: string }>(options?: KVNamespaceListOptions) {
    return this.kv.list<Metadata>(options);
  }

  get(key: string, cacheTtl?: number): Promise<string | null> {
    return this.kv.get(key, {
      type: 'text',
      cacheTtl,
    });
  }

  set(
    key: string,
    value: string,
    metadata?: Record<string, any>,
    cacheTtl?: number
  ): Promise<void> {
    return this.kv.put(key, JSON.stringify(value), {
      expirationTtl: cacheTtl,
      expiration: cacheTtl && Date.now() + cacheTtl * 1000,
      metadata,
    });
  }

  delete(key: string): Promise<void> {
    return this.kv.delete(key);
  }
}
