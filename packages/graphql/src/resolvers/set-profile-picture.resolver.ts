import { Context } from '../context';
import { MutationSetProfilePictureArgs, RequireFields, UserProfile } from './generated_types';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

export const setProfilePicture = async (
  {
    picture,
    address,
    provider,
  }: RequireFields<MutationSetProfilePictureArgs, 'picture' | 'address'>,
  ctx: Context
): Promise<UserProfile> => {
  // get user profile from durable object
  const durableObjId = ctx.env.ISCN_TXN.idFromName('user-profile');
  const stub = ctx.env.ISCN_TXN.get(durableObjId);
  const setUserProfileRequest = new Request(`${USER_PROFILE_DURABLE_OBJECT}/profiles/${address}`, {
    method: 'PATH',
    body: JSON.stringify({ profilePic: picture, profilePicProvider: provider }),
  });
  const getUserProfileResponse = await stub.fetch(setUserProfileRequest);
  const { userProfile } = await getUserProfileResponse.json<{ userProfile: UserProfile }>();

  return userProfile as unknown as UserProfile;
};
