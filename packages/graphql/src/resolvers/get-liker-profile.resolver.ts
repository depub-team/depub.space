import { Context } from '../context';
import type { LikerProfile, QueryGetLikerProfileArgs } from './generated_types';

export const PROFILE_KEY = 'profile';

export const getLikerProfileResolver = async (
  { dtagOrAddress }: QueryGetLikerProfileArgs,
  ctx: Context
): Promise<LikerProfile | null> => {
  const isDtag = !/^(cosmos1|like1)/.test(dtagOrAddress);
  const cacheKey = `${PROFILE_KEY}:liker:${dtagOrAddress}`;

  try {
    const cachedLikerLandProfile = await ctx.env.WORKERS_GRAPHQL_CACHE.get(cacheKey);

    if (cachedLikerLandProfile) {
      return JSON.parse(cachedLikerLandProfile);
    }

    let likerLandProfile: LikerProfile | null = null;

    if (!isDtag) {
      likerLandProfile = await ctx.dataSources.likerLandAPI.getProfile(dtagOrAddress);
    } else {
      likerLandProfile = await ctx.dataSources.likerLandAPI.getProfileByDtag(dtagOrAddress);
    }

    if (likerLandProfile) {
      await ctx.env.WORKERS_GRAPHQL_CACHE.put(cacheKey, JSON.stringify(likerLandProfile), {
        expirationTtl: 5 * 60,
      });
    }

    return likerLandProfile;
  } catch (ex: any) {
    // eslint-disable-next-line no-console
    console.error('getLikerLandProfile() -> ex: ', ex.message);
  }

  return null;
};
