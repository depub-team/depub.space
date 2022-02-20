import { ulidFactory } from 'ulid-workers';
import { ISCNRecord } from '../interfaces';
import { Bindings } from '../../bindings';

const ulid = ulidFactory({ monotonic: false });
const NEXT_SEQUENCE_KEY = 'sequence';
const TRANSACTION_KEY = 'transaction';
const AUTHOR_KEY = 'author';
const HASHTAG_KEY = 'hashtag';
const MENTION_KEY = 'mention';
const RECORD_KEY_KEY = 'record-key';

interface RecordKeys {
  transactionKey: string;
  authorTransactionKey: string;
  hashtagKeys: Map<string, string>;
  mentionKeys: Map<string, string>;
}
export class IscnTxn implements DurableObject {
  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {}

  public async addTransactions(request: Request) {
    const records = await request.json<ISCNRecord[]>();
    const hashTagRegex = /#[\p{L}\d]+/giu;
    const mentionRegex = /@[\p{L}\d]+/giu;

    if (!records || !Array.isArray(records)) {
      return new Response('Invalid body', {
        status: 403,
      });
    }

    // put into persistence storage
    await records
      .map(record => async () => {
        const { description } = record.data.contentMetadata;
        const recordKey = await this.state.storage.get(`${RECORD_KEY_KEY}:${record.data['@id']}`);
        const author = record.data.stakeholders.find(
          stakeholder => stakeholder.contributionType === 'http://schema.org/author'
        );

        if (!recordKey) {
          const hashtags = ((description || '') as string).match(hashTagRegex);
          const mentions = ((description || '') as string).match(mentionRegex);
          const transactionKey = `${TRANSACTION_KEY}:${ulid()}`;
          const authorTransactionKey = `${AUTHOR_KEY}:${author.entity['@id']}:${ulid()}`;
          const hashtagKeys = hashtags
            ? hashtags.map(tag => [tag, `${HASHTAG_KEY}:${tag.replace(/^#/, '')}:${ulid()}`])
            : [];
          const mentionKeys = mentions
            ? mentions.map(mention => [
                mention,
                `${MENTION_KEY}:${mention.replace(/^@/, '')}:${ulid()}`,
              ])
            : [];

          await this.state.storage.put(transactionKey, record); // storing the message key
          await this.state.storage.put(authorTransactionKey, transactionKey);
          await this.state.storage.put(`${RECORD_KEY_KEY}:${record.data['@id']}`, {
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

      transactionList = await this.state.storage.get<ISCNRecord>(Array.from(keyList.values()));
    } else if (mentioned) {
      const keyList = await this.state.storage.list<string>({
        prefix: `${MENTION_KEY}:${mentioned}`,
        reverse: true,
        limit,
        end: recordKeys?.mentionKeys.get(mentioned),
      });

      transactionList = await this.state.storage.get<ISCNRecord>(Array.from(keyList.values()));
    } else if (hashtag) {
      const keyList = await this.state.storage.list<string>({
        prefix: `${HASHTAG_KEY}:${hashtag}`,
        reverse: true,
        limit,
        end: recordKeys?.mentionKeys.get(hashtag),
      });

      transactionList = await this.state.storage.get<ISCNRecord>(Array.from(keyList.values()));
    } else {
      transactionList = await this.state.storage.list<ISCNRecord>({
        prefix,
        reverse: true,
        limit,
        end: recordKeys?.transactionKey,
      });
    }

    const transactions = transactionList && Array.from(transactionList.values());

    return new Response(
      JSON.stringify({
        transactions,
      })
    );
  }

  public async getSequence(_request: Request) {
    await this.state.storage.deleteAll();

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
        return this.getTransaction(request);
      }
    }

    return new Response(null, { status: 403 });
  }
}
