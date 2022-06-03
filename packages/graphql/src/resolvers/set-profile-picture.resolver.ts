import { fromBech32 } from '@cosmjs/encoding';
import { verifyArbitrary } from '../utils/verify-arbitrary';
import { Context } from '../context';
import { MutationSetProfilePictureArgs, RequireFields, UserProfile } from './generated_types';
import { toLike } from '../utils';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

export const setProfilePicture = async (
  {
    picture,
    address,
    provider,
  }: RequireFields<MutationSetProfilePictureArgs, 'picture' | 'address'>,
  ctx: Context
): Promise<UserProfile> => {
  const { prefix } = fromBech32(address);
  const isVerified = await verifyArbitrary(
    ctx.env.SIGN_MESSAGE,
    ctx.authPublicKey,
    ctx.authSignature,
    prefix
  );

  if (!isVerified) {
    throw new Error('Invalid signature');
  }

  // get user profile from durable object
  const durableObjId = ctx.env.USER_PROFILE.idFromName('user-profile');
  const stub = ctx.env.USER_PROFILE.get(durableObjId);
  const likePrefixedAddress = /^like/.test(address) ? address : toLike(address);
  const setUserProfileRequest = new Request(
    `${USER_PROFILE_DURABLE_OBJECT}/profiles/${likePrefixedAddress}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ profilePic: picture, profilePicProvider: provider }),
    }
  );
  const setUserProfileResponse = await stub.fetch(setUserProfileRequest);
  const userProfile = await setUserProfileResponse.json<UserProfile>();

  return {
    ...userProfile,
    address,
  } as unknown as UserProfile;
};
