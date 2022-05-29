import { changeAddressPrefix } from '../utils';
import { Context } from '../context';
import { NFTAsset } from '../interfaces/nft-asset.interface';

export const getOmniflixNFTsByOwner = async (owner: string, ctx: Context): Promise<NFTAsset[]> => {
  const omniflixAddress = changeAddressPrefix(owner, 'omniflix');
  const omniflixAssets = await ctx.dataSources.omniflixAPI.getNFTsByOwner(omniflixAddress);

  return omniflixAssets;
};
