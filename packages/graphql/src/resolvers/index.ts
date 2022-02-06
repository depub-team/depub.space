import { ISCNRecord } from '@likecoin/iscn-js';
import { ApolloError } from 'apollo-server-errors';
import { Context } from '../context';
import KVCache from '../kv-cache';
import { InputMaybe, Message, Profile, Resolvers } from './generated_types';

const PAGING_LIMIT = 12;
const cache = new KVCache();

export class ISCNError extends ApolloError {
  constructor(message: string) {
    super(message, 'ISCN_ERROR');

    Object.defineProperty(this, 'name', { value: 'ISCNError' });
  }
}

const getAuthorAddress = ({ data }: ISCNRecord) => {
  const author = data.stakeholders.find(
    stakeholder => stakeholder.contributionType === 'http://schema.org/author'
  );

  return author.entity['@id'];
};

const transformRecord = (record: ISCNRecord, profile: Profile | null) => {
  const from = getAuthorAddress(record);
  const { data } = record;

  return {
    id: data['@id'] as string,
    message: data.contentMetadata.description,
    from,
    profile,
    date: new Date(data.contentMetadata.recordTimestamp || data.recordTimestamp).toISOString(),
    images: data.contentFingerprints
      .filter(c => /^ipfs/.test(c))
      .map(c => `https://cloudflare-ipfs.com/ipfs/${c.split('ipfs://')[1]}`),
  } as Message;
};

const getUser = async (walletAddress: string, ctx: Context) => {
  const profile = await ctx.dataSources.desmosAPI.getProfile(walletAddress);

  return {
    id: walletAddress,
    profile,
  };
};

interface GetMessagesByUserArgs {
  walletAddress: string;
  previousId?: InputMaybe<string>;
  limit?: InputMaybe<number>;
}

interface GetMessagesArgs {
  limit?: InputMaybe<number>;
  previousId?: InputMaybe<string>;
  tag?: InputMaybe<string>;
}

const getMessagesByUser = async (args: GetMessagesByUserArgs, ctx: Context) => {
  const cachingKey = `getMessagesByUser(walletAddress: ${args.walletAddress}, previousId: ${args.previousId}, limit: ${args.limit})`;
  const cachedRecords = await cache.get(cachingKey);

  if (!ctx.noCache && cachedRecords) {
    return JSON.parse(cachedRecords) as Message[];
  }

  try {
    if (args.walletAddress) {
      const records = await ctx.dataSources.iscnQueryAPI.queryRecordsByOwner(args.walletAddress);
      const filteredRecords = records
        .reverse()
        .filter(r => r.data.contentFingerprints.includes(ISCN_FINGERPRINT));
      const offset = args.previousId
        ? filteredRecords.findIndex(r => r.data['@id'] === args.previousId) + 1
        : 0;
      const end = offset + (args.limit || PAGING_LIMIT);
      const messages = await filteredRecords
        .slice(offset, end)
        .map(r => async () => {
          const authorAddress = getAuthorAddress(r);
          const userProfile = await ctx.dataSources.desmosAPI.getProfile(authorAddress);
          const message = transformRecord(r, userProfile);

          return message;
        })
        .reduce(async (p, op) => {
          const list = await p;
          const msgs = await op();

          return list.concat(msgs);
        }, Promise.resolve([] as Message[]));

      await cache.set(cachingKey, JSON.stringify(messages));

      return messages;
    }
  } catch (ex: any) {
    throw new ISCNError(ex.message);
  }

  return [];
};

const getMessages = async (args: GetMessagesArgs, ctx: Context) => {
  const cachingKey = `getMessages(tag: ${args.tag}, previousId: ${args.previousId}, limit: ${args.limit})`;
  const cachedRecords = await cache.get(cachingKey);

  if (!ctx.noCache && cachedRecords) {
    return JSON.parse(cachedRecords) as Message[];
  }

  try {
    const records = await ctx.dataSources.iscnQueryAPI.queryRecordsByFingerprint(ISCN_FINGERPRINT);
    const tagRegExp = args.tag && new RegExp(`#${args.tag}`, 'gi');
    const filteredRecords = records
      .reverse()
      .filter(r => (tagRegExp ? tagRegExp.test(r.data.contentMetadata.description) : true)); // filter by tags
    const offset = args.previousId
      ? filteredRecords.findIndex(r => r.data['@id'] === args.previousId) + 1
      : 0;
    const end = offset + (args.limit || PAGING_LIMIT);
    const messages = await filteredRecords
      .slice(offset, end)
      .filter(r => r.data.contentFingerprints.includes(ISCN_FINGERPRINT)) // only published by depub.space
      .map(r => async () => {
        const authorAddress = getAuthorAddress(r);
        const userProfile = await ctx.dataSources.desmosAPI.getProfile(authorAddress);
        const message = transformRecord(r, userProfile);

        return message;
      })
      .reduce(async (p, op) => {
        const list = await p;
        const msgs = await op();

        return list.concat(msgs);
      }, Promise.resolve([] as Message[]));

    await cache.set(cachingKey, JSON.stringify(messages));

    return messages;
  } catch (ex: any) {
    throw new ISCNError(ex.message);
  }
};

const resolvers: Resolvers = {
  Query: {
    getUser: (_parent, args, ctx) => getUser(args.address, ctx),
    messages: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByTag: async (_parent, args, ctx) => getMessages(args, ctx),
  },
  User: {
    messages: async (parent, args, ctx) =>
      getMessagesByUser(
        {
          walletAddress: parent.id,
          ...args,
        },
        ctx
      ),
  },
};

export { resolvers };
