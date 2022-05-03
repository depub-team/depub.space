import { toBech32, fromBech32 } from 'cosmwasm';

export const toStars = (addr: string) => {
  try {
    const { prefix, data } = fromBech32(addr);
    // limit to prefixes coin type 118, known to work with keplr
    // https://medium.com/chainapsis/keplr-explained-coin-type-118-9781d26b2c4e
    const compatiblePrefixes = ['osmo', 'cosmos', 'stars', 'regen', 'like'];

    if (!compatiblePrefixes.includes(prefix)) {
      throw new Error(`Address not compatible with Keplr: ${addr}`);
    }

    const starsAddr = toBech32('stars', data);
    // wallet address length 20, contract address length 32

    if (![20, 32].includes(data.length)) {
      throw new Error(`Invalid address: ${addr} ${starsAddr}`);
    }

    return starsAddr;
  } catch (e) {
    throw new Error(`Invalid address: ${addr},${e}`);
  }
};
