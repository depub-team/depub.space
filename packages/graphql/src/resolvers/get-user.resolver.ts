import { Context } from '../context';
import { getUserProfile } from './get-user-profile.resolver';

export const getUser = async (dtagOrAddress: string, ctx: Context) => {
  const profile = await getUserProfile({ dtagOrAddress }, ctx);

  return {
    address: profile.address,
    profile,
  };
};
