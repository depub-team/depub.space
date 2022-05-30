import { toBech32, fromBech32 } from '@cosmjs/encoding';

export const changeAddressPrefix = (address: string, targetPrefix: string) => {
  try {
    const { prefix, data } = fromBech32(address);
    // limit to prefixes coin type 118, known to work with keplr
    // https://medium.com/chainapsis/keplr-explained-coin-type-118-9781d26b2c4e
    const compatiblePrefixes = ['osmo', 'cosmos', 'stars', 'regen', 'like'];

    if (!compatiblePrefixes.includes(prefix)) {
      throw new Error(`Address not compatible with Keplr: ${address}`);
    }

    const updatedAddr = toBech32(targetPrefix, data);
    // wallet address length 20, contract address length 32

    if (![20, 32].includes(data.length)) {
      throw new Error(`Invalid address: ${address} ${updatedAddr}`);
    }

    return updatedAddr;
  } catch (e) {
    throw new Error(`Invalid address: ${address},${e}`);
  }
};
