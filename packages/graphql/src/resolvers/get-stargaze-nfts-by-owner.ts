import { changeAddressPrefix } from '../utils';
import { Context } from '../context';
import { NFTAsset } from '../interfaces/nft-asset.interface';

export const getStargazeNFTsByOwner = async (owner: string, ctx: Context): Promise<NFTAsset[]> => {
  const starsAddress = changeAddressPrefix(owner, 'stars');
  const stargazeAssets = await ctx.dataSources.stargazeAPI.getNFTsByOwner(starsAddress);

  return stargazeAssets;
};
