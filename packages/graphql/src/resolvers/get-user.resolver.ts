import { Context } from '../context';
import { getUserProfileResolver } from './get-user-profile.resolver';

export const getUser = async (dtagOrAddress: string, ctx: Context) => {
  const profile = await getUserProfileResolver({ dtagOrAddress }, ctx);

  return {
    address: profile.address,
    profile,
  };
};
