import { ISCNQueryClient, ISCNRecord } from '@likecoin/iscn-js';
import { ulidFactory } from 'ulid-workers';
import { Bindings } from '../bindings';
import { KVStore } from '../kv-store';

const ulid = ulidFactory({ monotonic: false });

export class IscnTxn implements DurableObject {
  protected nextSequence: number;

  private queryClient!: ISCNQueryClient;

  protected kvStore: KVStore;

  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {
    this.queryClient = new ISCNQueryClient();
    this.kvStore = new KVStore(this.env.WORKERS_GRAPHQL_CACHE);

    this.state.blockConcurrencyWhile(async () => {
      const nextSequence = (await this.state.storage.get<number>('last_sequence')) || 0;
      // After initialization, future reads do not need to access storage.

      this.nextSequence = nextSequence;
    });
  }

  public async getStoredTransactions() {
    let result = await this.kvStore.list({ prefix: 'messages:' });
    let { keys } = result;

    while (result.list_complete) {
      // eslint-disable-next-line no-await-in-loop
      result = await this.kvStore.list();
      keys = keys.concat(result.keys);
    }

    return keys;
  }

  public async fetch(request: Request) {
    const limit = (request as any).query?.limit || 12;
    const from = (request as any).query?.from;
    const author = (request as any).query?.author;
    const mentioned = (request as any).query?.mentioned;
    const hashtag = (request as any).query?.hashtag;
    let storedKeys = await this.getStoredTransactions();
    const newTransactions: ISCNRecord['data'][] = [];
    let records: ISCNRecord[] = [];
    const res = await this.queryClient.queryRecordsByFingerprint(
      ISCN_FINGERPRINT,
      this.nextSequence
    );

    if (res) {
      records = res.records;
      let { nextSequence } = res;

      while (nextSequence.gt(0)) {
        // eslint-disable-next-line no-await-in-loop
        const res2 = await this.queryClient.queryRecordsByFingerprint(
          ISCN_FINGERPRINT,
          nextSequence.toNumber()
        );

        if (res2) {
          nextSequence = res2.nextSequence;
          records = [...records, ...res2.records];
        }
      }
    }

    // store transactions
    await Promise.all(
      records.map(async r => {
        const { data } = r;
        const id = data['@id'];
        const isTxnStored = storedKeys.find(key => key.metadata?.id === id);
        const key = `messages:${ulid(new Date(data.contentMetadata.recordTimestamp).getTime())}`;
        const hashTagRegex = /#[\p{L}\d]+/giu;
        const mentionRegex = /@[\p{L}\d]+/giu;
        const hashtags = ((data.contentMetadata.description || '') as string).match(hashTagRegex);
        const recordAuthor = data.stakeholders.find(
          stakeholder => stakeholder.contributionType === 'http://schema.org/author'
        );

        const mentions = ((data.contentMetadata.description || '') as string).match(mentionRegex);

        if (!isTxnStored) {
          newTransactions.push(data);

          await this.kvStore.set(key, JSON.stringify(data), {
            id,
            recordTimestamp: data.contentMetadata.recordTimestamp,
            author: recordAuthor,
            hashtags,
            mentions,
          });
        }
      })
    );

    // get new stored keys
    storedKeys = await this.getStoredTransactions();
    const fromIndex = from ? storedKeys.findIndex(key => key === from) : storedKeys.length - 1;

    // apply filter
    if (mentioned) {
      storedKeys = storedKeys.filter(key => key.metadata?.mentions.includes(mentioned));
    } else if (hashtag) {
      storedKeys = storedKeys.filter(key => key.metadata?.hashtags.includes(hashtag));
    } else if (author) {
      storedKeys = storedKeys.filter(key => key.metadata?.author === author);
    }

    // apply pagination
    const paginatedRecords = storedKeys.slice(fromIndex - limit, fromIndex);

    // get stored records from kv with
    const storedRecords = await Promise.all(
      paginatedRecords.map(async key => {
        const record = await this.kvStore.get(key.name);

        return record && JSON.parse(record);
      })
    );

    // concatenate and sort new transactions
    const sortedRecords = storedRecords
      .concat(newTransactions)
      .sort((a, b) =>
        new Date(a.data.contentMetadata.recordTimestamp) >
        new Date(b.data.contentMetadata.recordTimestamp)
          ? -1
          : 1
      );

    return new Response(JSON.stringify(sortedRecords));
  }
}
