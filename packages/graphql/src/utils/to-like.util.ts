import { bech32 } from 'bech32';

export const toLike = (address: string): string => {
  const rawAddress = bech32.decode(address);

  return bech32.encode('like', new Uint8Array(rawAddress.words));
};
