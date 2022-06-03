import { ISCNError } from '../iscn-error';
import { getLikecoinAddressByProfile } from '../datasources/desmos.api';
import { Context } from '../context';
import type {
  QueryGetUserProfileArgs,
  RequireFields,
  UserProfile,
  DesmosProfile,
} from './generated_types';
import { getDesmosProfile } from './get-desmos-profile.resolver';
import { toLike } from '../utils';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

const mergeProfile = (userProfile: UserProfile, desmosProfile: DesmosProfile | null) =>
  ({
    ...userProfile,
    ...(desmosProfile
      ? {
          profilePic: userProfile.profilePic || desmosProfile.profilePic,
          coverPic: userProfile.coverPic || desmosProfile.coverPic,
          bio: userProfile.bio || desmosProfile.bio,
          nickname: userProfile.nickname || desmosProfile.nickname,
        }
      : undefined),
  } as UserProfile);

export const getUserProfile = async (
  { dtagOrAddress }: RequireFields<QueryGetUserProfileArgs, 'dtagOrAddress'>,
  ctx: Context
): Promise<UserProfile> => {
  let address = dtagOrAddress;

  // get desmos profile
  const desmosProfile = await getDesmosProfile({ dtagOrAddress }, ctx);

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
  const getUserProfileRequest = new Request(`${USER_PROFILE_DURABLE_OBJECT}/profiles/${address}`, {
    method: 'GET',
  });
  const getUserProfileResponse = await stub.fetch(getUserProfileRequest);

  if (getUserProfileResponse.status === 200) {
    const { userProfile } = await getUserProfileResponse.json<{ userProfile: UserProfile }>();

    return mergeProfile({ ...userProfile, address }, desmosProfile);
  }

  if (!address) {
    throw new ISCNError('Not found');
  }

  return mergeProfile(
    {
      address,
    },
    desmosProfile
  );
};
