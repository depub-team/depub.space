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
    return this.kv.put(key, value, {
      expirationTtl: cacheTtl,
      metadata,
    });
  }

  delete(key: string): Promise<void> {
    return this.kv.delete(key);
  }
}
