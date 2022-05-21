import { Context } from '../context';
import { QueryGetUserProfileArgs, RequireFields, UserProfile } from './generated_types';

export const USER_PROFILE_DURABLE_OBJECT = 'http://user-profile';

export const getUserProfile = async (
  { address }: RequireFields<QueryGetUserProfileArgs, 'address'>,
  ctx: Context
): Promise<UserProfile> => {
  // get user profile from durable object
  const durableObjId = ctx.env.USER_PROFILE.idFromName('user-profile');
  const stub = ctx.env.USER_PROFILE.get(durableObjId);
  const getUserProfileRequest = new Request(`${USER_PROFILE_DURABLE_OBJECT}/profiles/${address}`, {
    method: 'GET',
  });
  const getUserProfileResponse = await stub.fetch(getUserProfileRequest);

  console.log('getUserProfileResponse =', getUserProfileResponse);

  const { userProfile } = await getUserProfileResponse.json<{ userProfile: UserProfile }>();

  return userProfile as unknown as UserProfile;
};
