import { DesmosProfile } from '../../interfaces';

export const getLikecoinAddressByProfile = (profile: DesmosProfile) => {
  const profileChainLink = profile.chainLinks?.find(cl => cl?.chainConfig?.name === 'likecoin');
  const likecoinAddress = profileChainLink?.externalAddress;

  return likecoinAddress;
};
