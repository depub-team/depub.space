import { Context } from '../context';
import { getUserProfile } from './get-user-profile.resolver';

export const getUser = async (address: string, ctx: Context) => {
  const profile = await getUserProfile({ address }, ctx);

  return {
    address,
    profile,
  };
};
