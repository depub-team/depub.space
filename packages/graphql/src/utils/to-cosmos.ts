import { fromBech32, toBech32 } from 'cosmwasm';

export const toCosmos = (address: string): string => {
  const rawAddress = fromBech32(address);

  return toBech32('cosmos', rawAddress.data);
};
