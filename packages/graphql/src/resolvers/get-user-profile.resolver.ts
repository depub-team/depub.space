import { ISCNError } from '../iscn-error';
import { getLikecoinAddressByProfile } from '../datasources/desmos.api';
import type { Context } from '../context';
import type {
  QueryGetUserProfileArgs,
  RequireFields,
  UserProfile,
  DesmosProfile,
} from './generated_types';
import { getDesmosProfileResolver } from './get-desmos-profile.resolver';
import { toLike } from '../utils';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

const USER_PROFILE_KEY = 'user_profile';
const ISCN_TXN_DURABLE_OBJECT = 'http://iscn-txn';
const CACHE_TTL = 5 * 60; // 5 minutes

const mergeProfile = (userProfile: UserProfile, desmosProfile: DesmosProfile | null) => {
  const hasDesmosProfilePic = !!desmosProfile?.profilePic;
  const profilePicProvider =
    userProfile.profilePicProvider || (hasDesmosProfilePic ? 'desmos' : null);

  return {
    ...userProfile,
    ...(desmosProfile
      ? {
          profilePic: userProfile.profilePic || desmosProfile.profilePic,
          coverPic: userProfile.coverPic || desmosProfile.coverPic,
          bio: userProfile.bio || desmosProfile.bio,
          nickname: userProfile.nickname || desmosProfile.nickname,
          profilePicProvider,
        }
      : undefined),
  } as UserProfile;
};

export const getUserProfileResolver = async (
  { dtagOrAddress }: RequireFields<QueryGetUserProfileArgs, 'dtagOrAddress'>,
  ctx: Context
): Promise<UserProfile> => {
  let address = dtagOrAddress;
  let numOfTweets = 0;
  const cacheKey = `${USER_PROFILE_KEY}:${address}`;
  const cachedUserProfile = await ctx.env.WORKERS_GRAPHQL_CACHE.get(cacheKey);

  if (cachedUserProfile) {
    return JSON.parse(cachedUserProfile);
  }

  // get desmos profile
  const desmosProfile = await getDesmosProfileResolver({ dtagOrAddress }, ctx);

  if (desmosProfile) {
    const likecoinAddress = getLikecoinAddressByProfile(desmosProfile);

    if (likecoinAddress) {
      address = likecoinAddress;
    }
  }

  if (!/^(like|cosmos)/.test(address)) {
    throw new ISCNError('Not found');
  }

  // unify to be likecoin address
  if (!address.startsWith('like')) {
    address = toLike(address);
  }

  // get user profile from durable object
  const durableObjId = ctx.env.USER_PROFILE.idFromName('user-profile');
  const stub = ctx.env.USER_PROFILE.get(durableObjId);
  const iscnTxnDurableObjId = ctx.env.ISCN_TXN.idFromName('iscn-txn');
  const iscnTxnStub = ctx.env.ISCN_TXN.get(iscnTxnDurableObjId);
  const getUserProfileRequest = new Request(`${USER_PROFILE_DURABLE_OBJECT}/profiles/${address}`, {
    method: 'GET',
  });
  const getTweetCountByUser = new Request(`${ISCN_TXN_DURABLE_OBJECT}/countByAuthor/${address}`, {
    method: 'GET',
  });
  const getUserProfileResponse = await stub.fetch(getUserProfileRequest);
  const getTweetCountByUserResponse = await iscnTxnStub.fetch(getTweetCountByUser);

  if (getTweetCountByUserResponse.status === 200) {
    const getTweetCountByUserJSON = await getTweetCountByUserResponse.json<{ count: number }>();

    numOfTweets = getTweetCountByUserJSON.count;
  }

  if (getUserProfileResponse.status === 200) {
    const { userProfile } = await getUserProfileResponse.json<{ userProfile: UserProfile }>();
    const mergedUserProfile = mergeProfile({ ...userProfile, address, numOfTweets }, desmosProfile);

    // put records into kv cache
    await ctx.env.WORKERS_GRAPHQL_CACHE.put(cacheKey, JSON.stringify(mergedUserProfile), {
      expirationTtl: CACHE_TTL,
    });

    return mergedUserProfile;
  }

  if (!address) {
    throw new ISCNError('Not found');
  }

  const mergedUserProfile = mergeProfile(
    {
      address,
      numOfTweets,
    },
    desmosProfile
  );

  await ctx.env.WORKERS_GRAPHQL_CACHE.put(cacheKey, JSON.stringify(mergedUserProfile), {
    expirationTtl: CACHE_TTL,
  });

  // return basic profile
  return mergedUserProfile;
};
