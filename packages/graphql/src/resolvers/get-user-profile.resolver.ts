import { ISCNError } from '../iscn-error';
import { getLikecoinAddressByProfile } from '../datasources/desmos.api';
import { Context } from '../context';
import type {
  QueryGetUserProfileArgs,
  RequireFields,
  UserProfile,
  DesmosProfile,
} from './generated_types';
import { getDesmosProfileResolver } from './get-desmos-profile.resolver';
import { changeAddressPrefix, toLike } from '../utils';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

const getNftImagesByOwnerOnOmniflix = async (address: string, ctx: Context) => {
  const omniflixAddress = changeAddressPrefix(address, 'omniflix');
  const nfts = await ctx.dataSources.omniflixAPI.getNFTsByOwner(omniflixAddress);

  return nfts.map(nft => nft.media);
};

const getNftImagesByOwnerOnStargaze = async (address: string, ctx: Context) => {
  const stargazeAddress = changeAddressPrefix(address, 'stars');
  const nfts = await ctx.dataSources.stargazeAPI.getNFTsByOwner(stargazeAddress);

  return nfts.map(nft => nft.media);
};

const updateProfilePicture = async (
  stub: DurableObjectStub,
  likePrefixedAddress: string,
  picture: string,
  provider: string
) => {
  const setUserProfileRequest = new Request(
    `${USER_PROFILE_DURABLE_OBJECT}/profiles/${likePrefixedAddress}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ profilePic: picture, profilePicProvider: provider }),
    }
  );
  const setUserProfileResponse = await stub.fetch(setUserProfileRequest);
  const userProfile = await setUserProfileResponse.json<UserProfile>();

  return userProfile;
};

const mergeProfile = (userProfile: UserProfile, desmosProfile: DesmosProfile | null) => {
  const hasDesmosProfilePic = !!desmosProfile?.profilePic;
  const profilePicProvider =
    userProfile.profilePicProvider || (hasDesmosProfilePic ? 'desmos' : '');

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
  const getUserProfileRequest = new Request(`${USER_PROFILE_DURABLE_OBJECT}/profiles/${address}`, {
    method: 'GET',
  });
  const getUserProfileResponse = await stub.fetch(getUserProfileRequest);

  if (getUserProfileResponse.status === 200) {
    const { userProfile } = await getUserProfileResponse.json<{ userProfile: UserProfile }>();
    const { profilePic } = userProfile;
    const { profilePicProvider } = userProfile;

    if (profilePic && profilePicProvider !== 'desmos') {
      const defaultProfilePic = desmosProfile?.profilePic || '';
      const defaultProfilePicProvider = defaultProfilePic ? 'desmos' : '';

      if (profilePicProvider === 'omniflix') {
        const nfts = await getNftImagesByOwnerOnOmniflix(address, ctx);

        if (!nfts.includes(profilePic)) {
          await updateProfilePicture(stub, address, defaultProfilePic, defaultProfilePicProvider);
        }

        userProfile.profilePic = defaultProfilePic;
        userProfile.profilePicProvider = defaultProfilePicProvider;
      } else if (profilePicProvider === 'stargaze') {
        const nfts = await getNftImagesByOwnerOnStargaze(address, ctx);

        if (!nfts.includes(profilePic)) {
          await updateProfilePicture(stub, address, defaultProfilePic, defaultProfilePicProvider);
        }

        userProfile.profilePic = defaultProfilePic;
        userProfile.profilePicProvider = defaultProfilePicProvider;
      }
    }

    return mergeProfile({ ...userProfile, address }, desmosProfile);
  }

  if (!address) {
    throw new ISCNError('Not found');
  }

  // return basic profile
  return mergeProfile(
    {
      address,
    },
    desmosProfile
  );
};
