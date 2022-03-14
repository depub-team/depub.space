import { ulidFactory } from 'ulid-workers';
import { ISCNTrend, ISCNRecord } from '../interfaces';
import { Bindings } from '../../bindings';

const ulid = ulidFactory({ monotonic: false });
const NEXT_SEQUENCE_KEY = 'sequence';
const TRANSACTION_KEY = 'transaction';
const AUTHOR_KEY = 'author';
const HASHTAG_KEY = 'hashtag';
const MENTION_KEY = 'mention';
const RECORD_KEY_KEY = 'record-key';

const sortByRecordTimestamp = (m: Map<string, ISCNRecord>) =>
  new Map(
    Array.from(m.entries()).sort((a, b) =>
      new Date(a[1].data.recordTimestamp as string).getTime() >
      new Date(b[1].data.recordTimestamp as string).getTime()
        ? -1
        : 1
    )
  );

interface RecordKeys {
  transactionKey: string;
  authorTransactionKey: string;
  hashtagKeys: Array<[key: string, value: string]>;
  mentionKeys: Array<[key: string, value: string]>;
}
export class IscnTxn implements DurableObject {
  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {
    // this.state.storage.deleteAll();
  }

  public async addTransactions(request: Request) {
    const records = await request.json<ISCNRecord[]>();
    const hashTagRegex = /#[\p{L}\d_-]+/giu;
    const mentionRegex = /@[\p{L}\d_-]+/giu;

    if (!records || !Array.isArray(records)) {
      return new Response('Invalid body', {
        status: 403,
      });
    }

    // put into persistence storage
    await records
      .map(record => async () => {
        const iscnId = record.data['@id'];
        const { description } = record.data.contentMetadata;
        const recordKey = await this.state.storage.get(`${RECORD_KEY_KEY}:${iscnId}`);
        const author = record.data.stakeholders.find(
          stakeholder => stakeholder.contributionType === 'http://schema.org/author'
        );

        if (!recordKey) {
          const hashtags = ((description || '') as string).match(hashTagRegex);
          const mentions = ((description || '') as string).match(mentionRegex);
          const transactionKey = `${TRANSACTION_KEY}:${ulid()}`;
          const authorTransactionKey = `${AUTHOR_KEY}:${author.entity['@id']}:${ulid()}`;
          const hashtagKeys = hashtags
            ? hashtags.map(tag => [
                tag.toLowerCase(),
                `${HASHTAG_KEY}:${tag.toLowerCase().replace(/^#/, '')}:${ulid()}`,
              ])
            : [];
          const mentionKeys = mentions
            ? mentions.map(mention => [
                mention.toLowerCase(),
                `${MENTION_KEY}:${mention.toLowerCase().replace(/^@/, '')}:${ulid()}`,
              ])
            : [];

          await this.state.storage.put(transactionKey, record); // storing the message key
          await this.state.storage.put(authorTransactionKey, transactionKey);
          await this.state.storage.put(`${RECORD_KEY_KEY}:${iscnId}`, {
            transactionKey,
            authorTransactionKey,
            hashtagKeys,
            mentionKeys,
          }); // storing the record

          await Promise.all(
            hashtagKeys.map(async ([, key]) => {
              await this.state.storage.put(key, transactionKey);
            })
          );

          await Promise.all(
            mentionKeys.map(async ([, key]) => {
              await this.state.storage.put(key, transactionKey);
            })
          );
        }
      })
      .reduce(async (p, op) => {
        await p;

        return op();
      }, Promise.resolve());

    return new Response(null, { status: 201 });
  }

  public async getTransaction(request: Request) {
    const url = new URL(request.url.replace(/^\//, ''));
    const iscnId = decodeURIComponent(url.pathname.split('/').pop() || '');

    if (!iscnId) {
      return new Response(undefined, { status: 404 });
    }

    const recordKeys = await this.state.storage.get<RecordKeys>(`${RECORD_KEY_KEY}:${iscnId}`);

    if (!recordKeys) {
      return new Response(undefined, { status: 404 });
    }

    const transaction = await this.state.storage.get<ISCNRecord>(recordKeys?.transactionKey);

    if (!transaction) {
      return new Response(undefined, { status: 404 });
    }

    return new Response(JSON.stringify(transaction));
  }

  public async getTransactions(request: Request) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '12', 10);
    const from = url.searchParams.get('from');
    const author = url.searchParams.get('author');
    const mentioned = url.searchParams.get('mentioned');
    const hashtag = url.searchParams.get('hashtag');
    const recordKeys = await this.state.storage.get<RecordKeys>(`${RECORD_KEY_KEY}:${from}`);
    const prefix = TRANSACTION_KEY;
    let transactionList: Map<string, ISCNRecord>;

    if (author) {
      const keyList = await this.state.storage.list<string>({
        prefix: `${AUTHOR_KEY}:${author}`,
        reverse: true,
        limit,
        end: recordKeys?.authorTransactionKey,
      });

      transactionList = sortByRecordTimestamp(
        await this.state.storage.get<ISCNRecord>(Array.from(keyList.values()))
      );
    } else if (mentioned) {
      const mentionKeysMap = new Map(
        // convert keys to lower case, since old keys were not storing in lower case
        recordKeys?.mentionKeys.map(([k, v]) => [k.toLocaleLowerCase(), v]) || []
      );
      const keyList = await this.state.storage.list<string>({
        prefix: `${MENTION_KEY}:${mentioned.toLocaleLowerCase()}:`,
        reverse: true,
        limit,
        end: mentionKeysMap.get(`@${mentioned.toLowerCase()}`),
      });

      transactionList = sortByRecordTimestamp(
        await this.state.storage.get<ISCNRecord>(Array.from(keyList.values()))
      );
    } else if (hashtag) {
      const hashTagKeysMap = new Map(
        // convert keys to lower case, since old keys were not storing in lower case
        recordKeys?.hashtagKeys.map(([k, v]) => [k.toLocaleLowerCase(), v]) || []
      );
      const keyList = await this.state.storage.list<string>({
        prefix: `${HASHTAG_KEY}:${hashtag.toLowerCase()}:`,
        reverse: true,
        limit,
        end: hashTagKeysMap.get(`#${hashtag.toLowerCase()}`),
      });

      transactionList = sortByRecordTimestamp(
        await this.state.storage.get<ISCNRecord>(Array.from(keyList.values()))
      );
    } else {
      transactionList = await this.state.storage.list<ISCNRecord>({
        prefix: `${prefix}:`,
        reverse: true,
        limit,
        end: recordKeys?.transactionKey,
      });
    }

    const transactions = transactionList ? Array.from(transactionList.values()) : [];

    return new Response(
      JSON.stringify({
        transactions,
      })
    );
  }

  public async getHashTags() {
    let lastKey: string | undefined;
    let keyListArr: [string, string][] = [];
    let lastBatchSize = -1;

    while (lastBatchSize !== 0) {
      // eslint-disable-next-line no-await-in-loop
      const keyList = await this.state.storage.list<string>({
        prefix: `${HASHTAG_KEY}:`,
        start: lastKey,
        limit: 100,
      });
      const listArr = Array.from(keyList.entries());

      lastBatchSize = listArr.length;
      const newLastKey = listArr[listArr.length - 1][0];

      if (newLastKey === lastKey) {
        break;
      }

      lastKey = newLastKey;
      keyListArr = keyListArr.concat(listArr);
    }

    const hashTagsWithCount = keyListArr.reduce((acc, [k]) => {
      const key = k.toLowerCase().split(':')[1];
      const count = acc[key] || 0;

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      acc[key] = count + 1;

      return acc;
    }, {} as Record<string, number>);

    const hashTags: ISCNTrend[] = Object.keys(hashTagsWithCount)
      .sort((a, b) => (hashTagsWithCount[a] > hashTagsWithCount[b] ? -1 : 1))
      .map(key => ({
        name: key,
        count: hashTagsWithCount[key],
      }));

    return new Response(JSON.stringify({ hashTags }));
  }

  public async getSequence(_request: Request) {
    // await this.state.storage.deleteAll(); // debug

    const nextSequence = (await this.state.storage.get<number>(NEXT_SEQUENCE_KEY)) || 0;

    return new Response(
      JSON.stringify({
        nextSequence,
      })
    );
  }

  public async updateSequence(request: Request) {
    const body = await request.json<{ nextSequence: number }>();

    if (body.nextSequence) {
      await this.state.storage.put(NEXT_SEQUENCE_KEY, body.nextSequence);
    }

    return new Response(null, { status: 201 });
  }

  public async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/sequence') {
      if (request.method === 'PUT') {
        return this.updateSequence(request);
      }

      if (request.method === 'GET') {
        return this.getSequence(request);
      }
    }

    if (url.pathname === '/transactions') {
      if (request.method === 'PUT') {
        return this.addTransactions(request);
      }

      if (request.method === 'GET') {
        return this.getTransactions(request);
      }
    }

    if (url.pathname === '/hashTags') {
      if (request.method === 'GET') {
        return this.getHashTags();
      }
    }

    if (/^\/transactions\/.+/.test(url.pathname)) {
      if (request.method === 'GET') {
        return this.getTransaction(request);
      }
    }

    return new Response(undefined, { status: 403 });
  }
}
