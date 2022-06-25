import { bech32 } from 'bech32';

export const toCosmos = (address: string): string => {
  const rawAddress = bech32.decode(address);

  return bech32.encode('cosmos', new Uint8Array(rawAddress.words));
};
