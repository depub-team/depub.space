import type { GetChannelsResponse, ChannelList, ISCNTrend } from '../interfaces';
import { Context } from '../context';

const ISCN_TXN_DURABLE_OBJECT = 'http://iscn-txn';
const LIST_KEY = 'list';
const TREND_KEY = 'trend';

export const getListFromNotionAPI = async (
  ctx: Context,
  countryCode?: string
): Promise<ChannelList[]> => {
  let myCountryCode = 'universal';
  const CACHE_KEY = `${LIST_KEY}_${myCountryCode}`;

  if (countryCode) {
    myCountryCode = countryCode;
  }

  // get cached data
  const cachedListData = await ctx.env.WORKERS_GRAPHQL_CACHE.get(CACHE_KEY);

  if (cachedListData) {
    return JSON.parse(cachedListData);
  }

  const databases = await ctx.dataSources.notionAPI.getDatabases();
  const databaseKeys = Object.keys(databases || {});

  if (!databases) {
    return [];
  }

  if (!databaseKeys.includes(myCountryCode)) {
    myCountryCode = 'universal';
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

export const getChannels = async (args: any, ctx: Context): Promise<GetChannelsResponse> => {
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
    const getHashTagRequest = new Request(`${ISCN_TXN_DURABLE_OBJECT}/hashTags`, {
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
