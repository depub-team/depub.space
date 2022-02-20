// eslint-disable-next-line import/no-extraneous-dependencies
import { ulidFactory } from 'ulid-workers';
import { KVStore } from './kv-store';

declare function getMiniflareBindings(): { WORKERS_GRAPHQL_CACHE: KVNamespace };

const ulid = ulidFactory({ monotonic: false });

describe('KVStore', () => {
  let kvStore: KVStore;
  let keys: string[];

  beforeEach(async () => {
    const now = Date.now();
    const { WORKERS_GRAPHQL_CACHE } = getMiniflareBindings();

    kvStore = new KVStore(WORKERS_GRAPHQL_CACHE as any);

    keys = await Array.from(new Array(10)) // add 10 kv records
      .map((_, i) => async () => {
        const date = new Date(now + i * 1000);

        const key = `prefix:${ulid(date.getTime())}`;

        await kvStore.set(
          key,
          JSON.stringify({
            date: date.toISOString(),
          }),
          {
            metadata: {
              id: i,
              date: date.toISOString(),
            },
          }
        );

        return key;
      })
      .reduce(async (p, op) => {
        const ret = await p;

        return [...ret, await op()];
      }, Promise.resolve([] as string[]));
  });

  it('should set key and value', async () => {
    await expect(kvStore.set('prefix:1234', 'foo')).resolves.toBeUndefined();
  });

  it('should get value by key', async () => {
    const val = await kvStore.get(keys[0]);

    expect(val).toBeTruthy(); // not null
  });

  it('should list all keys', async () => {
    const list = await kvStore.list();

    expect(list.keys.length).toBe(10);
  });
});
