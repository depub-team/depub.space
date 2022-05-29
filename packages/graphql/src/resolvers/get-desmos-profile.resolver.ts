import { Context } from '../context';
import type { DesmosProfile, QueryGetDesmosProfileArgs } from './generated_types';

export const PROFILE_KEY = 'profile';

export const getDesmosProfile = async (
  { dtagOrAddress }: QueryGetDesmosProfileArgs,
  ctx: Context
): Promise<DesmosProfile | null> => {
  const isDtag = !/^(cosmos1|like1)/.test(dtagOrAddress);
  const cacheKey = `${PROFILE_KEY}:desmos:${dtagOrAddress}`;

  try {
    const cachedDesmosProfile = await ctx.env.WORKERS_GRAPHQL_CACHE.get(cacheKey);

    if (cachedDesmosProfile) {
      return JSON.parse(cachedDesmosProfile);
    }

    let desmosProfile: DesmosProfile | null = null;

    if (!isDtag) {
      desmosProfile = await ctx.dataSources.desmosAPI.getProfile(dtagOrAddress);
    } else {
      desmosProfile = await ctx.dataSources.desmosAPI.getProfileByDtag(dtagOrAddress);
    }

    if (desmosProfile) {
      await ctx.env.WORKERS_GRAPHQL_CACHE.put(cacheKey, JSON.stringify(desmosProfile), {
        expirationTtl: 5 * 60,
      });
    }

    return desmosProfile;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error('getDesmosProfile() -> ex: ', ex.message);
  }

  return null;
};
