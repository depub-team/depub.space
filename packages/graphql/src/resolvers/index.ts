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

interface GetUserProfileArgs {
  dtagOrAddress: string;
}

const getProfile = async (dtagOrAddress: string, ctx: Context) => {
  const cachingKey = `getProfile(account: ${dtagOrAddress})`;

  try {
    let profile: any = null;
    const cachedRecords = await cache.get(cachingKey);

    if (cachedRecords && !ctx.noCache) {
      profile = JSON.parse(cachedRecords);
    } else {
      if (/^(cosmos1|like1)/.test(dtagOrAddress)) {
        profile = await ctx.dataSources.desmosAPI.getProfile(dtagOrAddress);
      } else {
        profile = await ctx.dataSources.desmosAPI.getProfileByDtag(dtagOrAddress);
      }

      if (profile) {
        await cache.set(cachingKey, JSON.stringify(profile));
      }
    }

    return profile;
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
  }

  return null;
};

const getUser = async (account: string, ctx: Context) => {
  const profile = await getProfile(account, ctx);

  return {
    id: account,
    profile,
  };
};

const getMessagesByUser = async (args: GetMessagesByUserArgs, ctx: Context) => {
  const cachingKey = `getMessagesByUser(walletAddress: ${args.walletAddress})`;

  try {
    if (args.walletAddress) {
      // get cached records
      const cachedRecords = await cache.get(cachingKey);
      let records: ISCNRecord[] = [];

      if (cachedRecords && !ctx.noCache) {
        records = JSON.parse(cachedRecords) as ISCNRecord[];
      } else {
        records = await ctx.dataSources.iscnQueryAPI.queryRecordsByOwner(args.walletAddress);

        await cache.set(cachingKey, JSON.stringify(records));
      }

      const filteredRecords = records
        .reverse()
        .filter(r => r.data.contentFingerprints.includes(ISCN_FINGERPRINT));
      const offset = args.previousId
        ? filteredRecords.findIndex(r => r.data['@id'] === args.previousId) + 1
        : 0;
      const end = offset + (args.limit || PAGING_LIMIT);
      const messages = await Promise.all(
        filteredRecords.slice(offset, end).map(async r => {
          const authorAddress = getAuthorAddress(r);
          const userProfile = await getProfile(authorAddress, ctx);
          const message = transformRecord(r, userProfile);

          return message;
        })
      );

      return messages;
    }
  } catch (ex: any) {
    throw new ISCNError(ex.message);
  }

  return [];
};

const getMessages = async (args: GetMessagesArgs, ctx: Context) => {
  const cachingKey = 'getMessages';

  try {
    // get cached records
    const cachedRecords = await cache.get(cachingKey);
    let records: ISCNRecord[] = [];

    if (cachedRecords && !ctx.noCache) {
      records = JSON.parse(cachedRecords) as ISCNRecord[];
    } else {
      records = await ctx.dataSources.iscnQueryAPI.queryRecordsByFingerprint(ISCN_FINGERPRINT);

      await cache.set(cachingKey, JSON.stringify(records));
    }

    const tagRegExp = args.tag && new RegExp(`#${args.tag}`, 'gi');
    const filteredRecords = records
      .reverse()
      .filter(r => (tagRegExp ? tagRegExp.test(r.data.contentMetadata.description) : true)); // filter by tags
    const offset = args.previousId
      ? filteredRecords.findIndex(r => r.data['@id'] === args.previousId) + 1
      : 0;
    const end = offset + (args.limit || PAGING_LIMIT);
    const messages = await Promise.all(
      filteredRecords
        .slice(offset, end)
        .filter(r => r.data.contentFingerprints.includes(ISCN_FINGERPRINT)) // only published by depub.space
        .map(async r => {
          const authorAddress = getAuthorAddress(r);
          const userProfile = await getProfile(authorAddress, ctx);
          const message = transformRecord(r, userProfile);

          return message;
        })
    );

    return messages;
  } catch (ex: any) {
    throw new ISCNError(ex.message);
  }
};

const getUserProfile = async (args: GetUserProfileArgs, ctx: Context) => {
  const profile = await getProfile(args.dtagOrAddress, ctx);

  return profile;
};

const resolvers: Resolvers = {
  Query: {
    getUser: (_parent, args, ctx) => getUser(args.dtagOrAddress, ctx),
    messages: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByTag: async (_parent, args, ctx) => getMessages(args, ctx),
    getUserProfile: (_parent, args, ctx) => getUserProfile(args, ctx),
  },
  User: {
    messages: async (parent, args, ctx) => {
      const profileChainLink = parent.profile?.chainLinks?.find(
        cl => cl?.chainConfig?.name === 'likecoin'
      );
      const walletAddress = profileChainLink?.externalAddress || parent.id;

      return getMessagesByUser(
        {
          walletAddress,
          ...args,
        },
        ctx
      );
    },
  },
};

export { resolvers };
