/* eslint-disable no-underscore-dangle */
import { ISCNError } from '../iscn-error';
import type { Context } from '../context';
import type {
  QueryGetUserProfileArgs,
  RequireFields,
  UserProfile,
  DesmosProfile,
  LikerProfile,
} from './generated_types';
import { toLike } from '../utils';
import { getLikerProfileResolver } from './get-liker-profile.resolver';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

const USER_PROFILE_KEY = 'user_profile';
const ISCN_TXN_DURABLE_OBJECT = 'http://iscn-txn';
const CACHE_TTL = 5 * 60; // 5 minutes

function mergeProfile(userProfile: UserProfile, otherProfile: LikerProfile): UserProfile;
function mergeProfile(
  userProfile: UserProfile,
  otherProfile: LikerProfile | DesmosProfile
): UserProfile {
  if (otherProfile?.__typename === 'DesmosProfile') {
    const hasDesmosProfilePic = !!otherProfile?.profilePic;
    const profilePicProvider =
      userProfile.profilePicProvider || (hasDesmosProfilePic ? 'desmos' : null);

    return {
      ...userProfile,
      ...(otherProfile
        ? {
            profilePic: userProfile.profilePic || otherProfile.profilePic,
            coverPic: userProfile.coverPic || otherProfile.coverPic,
            bio: userProfile.bio || otherProfile.bio,
            nickname: userProfile.nickname || otherProfile.nickname,
            profilePicProvider,
          }
        : undefined),
    } as UserProfile;
  }

  if (otherProfile?.__typename === 'LikerProfile') {
    const hasLikerProfilePic = !!otherProfile?.avatar;
    const profilePicProvider =
      userProfile.profilePicProvider || (hasLikerProfilePic ? 'liker' : null);

    return {
      ...userProfile,
      ...(otherProfile
        ? {
            profilePic: userProfile.profilePic || otherProfile.avatar,
            coverPic: userProfile.coverPic,
            bio: userProfile.bio,
            dtag: userProfile.dtag || otherProfile.user,
            nickname: userProfile.nickname || otherProfile.displayName,
            profilePicProvider,
          }
        : undefined),
    } as UserProfile;
  }

  return userProfile;
}

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

  // get liker profile
  const likerProfile = await getLikerProfileResolver({ dtagOrAddress }, ctx);

  if (likerProfile) {
    if (likerProfile.likeWallet) {
      address = likerProfile.likeWallet;
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
    const mergedUserProfile = !likerProfile
      ? { ...userProfile, address, numOfTweets }
      : mergeProfile({ ...userProfile, address, numOfTweets }, likerProfile);

    // put records into kv cache
    await ctx.env.WORKERS_GRAPHQL_CACHE.put(cacheKey, JSON.stringify(mergedUserProfile), {
      expirationTtl: CACHE_TTL,
    });

    return mergedUserProfile;
  }

  if (!address) {
    throw new ISCNError('Not found');
  }

  const mergedUserProfile = !likerProfile
    ? {
        address,
        numOfTweets,
      }
    : mergeProfile(
        {
          address,
          numOfTweets,
        },
        likerProfile
      );

  await ctx.env.WORKERS_GRAPHQL_CACHE.put(cacheKey, JSON.stringify(mergedUserProfile), {
    expirationTtl: CACHE_TTL,
  });

  // return basic profile
  return mergedUserProfile;
};

/* eslint-enable no-underscore-dangle */
