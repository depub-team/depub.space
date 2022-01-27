export const getShortenAddress = (address: string) =>
  `${address.slice(0, 10)}...${address.slice(-4)}`;
