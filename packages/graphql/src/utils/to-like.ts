import { fromBech32, toBech32 } from 'cosmwasm';

export const toLike = (address: string): string => {
  const rawAddress = fromBech32(address);

  return toBech32('like', rawAddress.data);
};
