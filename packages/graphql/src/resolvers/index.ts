import { ApolloError } from 'apollo-server-errors';
import { Context } from '../context';
import { InputMaybe, Message, Profile, Resolvers } from './generated_types';
import { KVStore } from '../kv-store';
import { DesmosProfileWithId, ISCNTrend, ISCNRecord } from '../interfaces';

const PAGING_LIMIT = 12;
const PROFILE_KEY = 'profile';
const LIST_KEY = 'list';
const TREND_KEY = 'trend';

export class ISCNError extends ApolloError {
  constructor(message: string) {
    super(message, 'ISCN_ERROR');

    Object.defineProperty(this, 'name', { value: 'ISCNError' });
  }
}

const getAuthorAddress = ({ data }: ISCNRecord): string => {
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

interface GetMessagesArgs {
  limit?: InputMaybe<number>;
  previousId?: InputMaybe<string>;
  tag?: InputMaybe<string>;
  author?: InputMaybe<string>;
  mentioned?: InputMaybe<string>;
}

interface GetMessageArgs {
  iscnId: string;
}

interface GetUserProfileArgs {
  dtagOrAddress: string;
}

type ChannelList = {
  name: string;
  hashTag: string;
};

interface GetChannelsResponse {
  hashTags: ISCNTrend[];
  list: ChannelList[];
}

const getProfile = async (dtagOrAddress: string, ctx: Context): Promise<Profile | null> => {
  const kvStore = new KVStore(ctx.env.WORKERS_GRAPHQL_CACHE);

  try {
    const cachedProfile = await kvStore.get(`${PROFILE_KEY}:${dtagOrAddress}`);

    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }

    let profile: DesmosProfileWithId | null = null;

    if (/^(cosmos1|like1)/.test(dtagOrAddress)) {
      profile = await ctx.dataSources.desmosAPI.getProfile(dtagOrAddress);
    } else {
      profile = await ctx.dataSources.desmosAPI.getProfileByDtag(dtagOrAddress);
    }

    if (profile) {
      await kvStore.set(
        `${PROFILE_KEY}:${dtagOrAddress}`,
        JSON.stringify(profile),
        {
          dtagOrAddress,
        },
        2 * 60
      ); // 2 mins
    }

    return profile as unknown as Profile;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error('getProfile() -> ex: ', ex.message);
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

const getLatestSequence = async (stub: DurableObjectStub) => {
  // get latest sequence
  const latestSequenceRequest = new Request('http://iscn-txn/sequence');
  const latestSequenceResponse = await stub.fetch(latestSequenceRequest);
  const latestSequenceResponseBody = await latestSequenceResponse.json<{ nextSequence: number }>();

  return latestSequenceResponseBody.nextSequence ? latestSequenceResponseBody.nextSequence : 0;
};

const updateLatestSequence = async (nextSequence: number, stub: DurableObjectStub) => {
  const updateSequenceRequest = new Request('http://iscn-txn/sequence', {
    method: 'PUT',
    body: JSON.stringify({
      nextSequence,
    }),
  });
  const updateSequenceResponse = await stub.fetch(updateSequenceRequest);

  if (updateSequenceResponse.status !== 201) {
    throw new ISCNError('Failed to update next sequence');
  }
};

const addTransactions = async (records: ISCNRecord[], stub: DurableObjectStub) => {
  const addTransactionRequest = new Request('http://iscn-txn/transactions', {
    method: 'PUT',
    body: JSON.stringify(records),
  });
  const addTransactionResponse = await stub.fetch(addTransactionRequest);

  if (addTransactionResponse.status !== 201) {
    throw new ISCNError('Failed to add transactions');
  }
};

interface GetTransactionsOptions {
  limit?: number;
  previousId?: string;
  hashtag?: string;
  mentioned?: string;
  author?: string;
}

const getTransaction = async (stub: DurableObjectStub, iscnId: string) => {
  const getTransactionRequest = new Request(
    `http://iscn-txn/transactions/${encodeURIComponent(iscnId)}`,
    {
      method: 'GET',
    }
  );
  const getTransactionResponse = await stub.fetch(getTransactionRequest);

  if (getTransactionResponse.status === 200) {
    const transaction = await getTransactionResponse.json<ISCNRecord>();

    return transaction || null;
  }

  return null;
};

const getTransactions = async (
  stub: DurableObjectStub,
  { limit = PAGING_LIMIT, previousId, hashtag, mentioned, author }: GetTransactionsOptions
) => {
  const urlSearchParams = new URLSearchParams(`limit=${limit}&from=${previousId}`);

  if (hashtag) {
    urlSearchParams.append('hashtag', hashtag);
  }

  if (mentioned) {
    urlSearchParams.append('mentioned', mentioned);
  }

  if (author) {
    urlSearchParams.append('author', author);
  }

  const getTransactionsRequest = new Request(
    `http://iscn-txn/transactions?${urlSearchParams.toString()}`,
    {
      method: 'GET',
    }
  );
  const getTransactionsResponse = await stub.fetch(getTransactionsRequest);
  const { transactions } = await getTransactionsResponse.json<{ transactions: ISCNRecord[] }>();

  return transactions || [];
};

const getMessage = async (args: GetMessageArgs, ctx: Context) => {
  try {
    const durableObjId = ctx.env.ISCN_TXN.idFromName('iscn-txn');
    const stub = ctx.env.ISCN_TXN.get(durableObjId);
    let transaction = await getTransaction(stub, args.iscnId);

    // get the iscn record directly on likecoin chain if not found in durable object storage
    if (!transaction) {
      transaction = await ctx.dataSources.iscnQueryAPI.getRecord(args.iscnId);

      // save it into durable object storage
      if (transaction) {
        await addTransactions([transaction], stub);
      }
    }

    if (!transaction) {
      throw new ISCNError('Not found');
    }

    const authorAddress = getAuthorAddress(transaction);
    const userProfile = await getProfile(authorAddress, ctx);
    const message = transformRecord(transaction, userProfile);

    return message;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);

    throw new ISCNError(ex.message);
  }
};

const getMessages = async (args: GetMessagesArgs, ctx: Context) => {
  try {
    // initial durable object
    const durableObjId = ctx.env.ISCN_TXN.idFromName('iscn-txn');
    const stub = ctx.env.ISCN_TXN.get(durableObjId);
    const limit = args.limit ? args.limit : PAGING_LIMIT;
    const hashtag = args.tag ? args.tag : undefined;
    const author = args.author ? args.author : undefined;
    const mentioned = args.mentioned ? args.mentioned : undefined;
    const previousId = args.previousId || undefined;

    // only getting new transactions from RPC when not in paginated
    if (!previousId) {
      // get latest sequence
      const latestSequence = await getLatestSequence(stub);

      // check new records
      const { records, nextSequence } = await ctx.dataSources.iscnQueryAPI.getRecords(
        ctx.env.ISCN_FINGERPRINT,
        latestSequence
      );

      if (nextSequence > latestSequence) {
        await updateLatestSequence(nextSequence, stub);
      }

      // add new transactions
      if (records.length) {
        await addTransactions(records, stub);
      }
    }

    const transactions = await getTransactions(stub, {
      limit,
      previousId,
      hashtag,
      mentioned,
      author,
    });

    const messages = await Promise.all(
      transactions.map(async t => {
        const authorAddress = getAuthorAddress(t);
        const userProfile = await getProfile(authorAddress, ctx);
        const message = transformRecord(t, userProfile);

        return message;
      })
    );

    return messages;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);

    throw new ISCNError(ex.message);
  }
};

const getUserProfile = async (args: GetUserProfileArgs, ctx: Context) => {
  const profile = await getProfile(args.dtagOrAddress, ctx);

  return profile;
};

const getListFromNotionAPI = async (ctx: Context, countryCode?: string): Promise<ChannelList[]> => {
  let myCountryCode = 'universal';
  const CACHE_KEY = `${LIST_KEY}_${myCountryCode.toUpperCase()}`;

  if (countryCode) {
    myCountryCode = countryCode;
  }

  // get cached data
  const cachedListData = await ctx.env.WORKERS_GRAPHQL_CACHE.get(CACHE_KEY);

  if (cachedListData) {
    return JSON.parse(cachedListData);
  }

  const databases = await ctx.dataSources.notionAPI.getDatabases();

  if (!databases) {
    return [];
  }

  const databaseIdByCountryCode = databases[myCountryCode];

  if (!databaseIdByCountryCode) {
    return [];
  }

  const list = await ctx.dataSources.notionAPI.getList(databaseIdByCountryCode);

  // put records into kv cache
  await ctx.env.WORKERS_GRAPHQL_CACHE.put(CACHE_KEY, JSON.stringify(list), {
    expirationTtl: 1 * 60, // 1 minute
  });

  return list;
};

const getChannels = async (args: any, ctx: Context): Promise<GetChannelsResponse> => {
  const { countryCode } = args;

  const getChannelsFromDurableObject = async (): Promise<ISCNTrend[]> => {
    // get cached data
    const cachedTrendData = await ctx.env.WORKERS_GRAPHQL_CACHE.get(TREND_KEY);

    if (cachedTrendData) {
      return JSON.parse(cachedTrendData);
    }

    // initialize durable object
    const durableObjId = ctx.env.ISCN_TXN.idFromName('iscn-txn');
    const stub = ctx.env.ISCN_TXN.get(durableObjId);
    const getHashTagRequest = new Request(`http://iscn-txn/hashTags`, {
      method: 'GET',
    });
    const getHashTagResponse = await stub.fetch(getHashTagRequest);
    const { hashTags } = await getHashTagResponse.json<{
      hashTags: ISCNTrend[];
      lastKey: string;
    }>();

    const trimmedRecords = hashTags.slice(0, 30);

    // put records into kv cache
    await ctx.env.WORKERS_GRAPHQL_CACHE.put(TREND_KEY, JSON.stringify(trimmedRecords), {
      expirationTtl: 10 * 60, // 10 minutes
    });

    return trimmedRecords;
  };

  try {
    const hashTags = await getChannelsFromDurableObject();
    const list = await getListFromNotionAPI(ctx, countryCode);

    return { hashTags, list };
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error(ex);
  }

  return { hashTags: [], list: [] };
};

const resolvers: Resolvers = {
  Query: {
    getUser: (_parent, args, ctx) => getUser(args.dtagOrAddress, ctx),
    messages: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByHashTag: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByMentioned: async (_parent, args, ctx) => getMessages(args, ctx),
    getUserProfile: (_parent, args, ctx) => getUserProfile(args, ctx),
    getMessage: (_parent, args, ctx) => getMessage(args, ctx),
    getChannels: (_parent, args, ctx) => getChannels(args, ctx),
  },
  User: {
    messages: async (parent, args, ctx) => {
      const walletAddress = parent.profile?.id || parent.id;

      return getMessages(
        {
          author: walletAddress,
          ...args,
        },
        ctx
      );
    },
  },
};

export { resolvers };
