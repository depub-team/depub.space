import { ISCNRecord } from '@likecoin/iscn-js';
import { ApolloError, ForbiddenError } from 'apollo-server-errors';
import { Context } from '../context';
import { Message, Profile, Resolvers } from './generated_types';

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

const getMessageByUser = async (walletAddress: string, ctx: Context) => {
  try {
    if (walletAddress) {
      const profile = await ctx.dataSources.desmosAPI.getProfile(walletAddress);
      const records = await ctx.dataSources.iscnQueryAPI.queryRecordsByOwner(walletAddress);
      const messages = await records
        .reverse()
        .filter(r => r.data.contentFingerprints.includes(ISCN_FINGERPRINT))
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

      return {
        id: walletAddress,
        profile,
        messages,
      };
    }
  } catch (ex: any) {
    throw new ISCNError(ex.message);
  }

  return {
    id: walletAddress,
    profile: null,
    messages: [],
  };
};

const resolvers: Resolvers = {
  Query: {
    me: async (_parent, _args, ctx) => {
      const { walletAddress } = ctx;

      if (!walletAddress) {
        throw new ForbiddenError('No wallet address provided');
      }

      return getMessageByUser(walletAddress, ctx);
    },
    getUser: (_parent, args, ctx) => getMessageByUser(args.address, ctx),
    messages: async (_parent, args, ctx) => {
      try {
        const records = await ctx.dataSources.iscnQueryAPI.queryRecordsByFingerprint(
          ISCN_FINGERPRINT
        );
        const tagRegExp = args.tag && new RegExp(`#${args.tag}`, 'gi');
        const messages = await records
          .reverse()
          .filter(r => (tagRegExp ? tagRegExp.test(r.data.contentMetadata.description) : true)) // filter by tags
          .slice(args.offset || 0, args.limit || 10)
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

        return messages;
      } catch (ex: any) {
        throw new ISCNError(ex.message);
      }
    },
  },
};

export { resolvers };
