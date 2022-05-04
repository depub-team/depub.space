import { Resolvers } from './generated_types';
import { getChannels } from './get-channels.resolver';
import { getDesmosProfile } from './get-desmos-profile.resolver';
import { getUserProfile } from './get-user-profile.resolver';
import { getUser } from './get-user.resolver';
import { getMessages } from './get-messages.resolver';
import { getMessage } from './get-message.resolver';
import { setProfilePicture } from './set-profile-picture.resolver';
import { toLike, changeAddressPrefix } from '../utils';
import { Context } from '../context';
import { NFTAsset } from '../interfaces/nft-asset.interface';

const getStargazeNFTsByOwner = async (owner: string, ctx: Context): Promise<NFTAsset[]> => {
  const starsAddress = changeAddressPrefix(owner, 'stars');
  const stargazeAssets = await ctx.dataSources.stargazeAPI.getNFTsByOwner(starsAddress);

  return stargazeAssets;
};

const getOmniflixNFTsByOwner = async (owner: string, ctx: Context): Promise<NFTAsset[]> => {
  const omniflixAddress = changeAddressPrefix(owner, 'omniflix');
  const omniflixAssets = await ctx.dataSources.omniflixAPI.getNFTsByOwner(omniflixAddress);

  return omniflixAssets;
};

const resolvers: Resolvers = {
  Query: {
    getUser: (_parent, args, ctx) => getUser(args.address, ctx),
    messages: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByHashTag: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByMentioned: async (_parent, args, ctx) => getMessages(args, ctx),
    getDesmosProfile: (_parent, args, ctx) => getDesmosProfile(args, ctx),
    getUserProfile: (_parent, args, ctx) => getUserProfile(args, ctx),
    getMessage: (_parent, args, ctx) => getMessage(args, ctx),
    getChannels: (_parent, args, ctx) => getChannels(args, ctx),
    getOmniflixNFTsByOwner: (_parent, args, ctx) => getOmniflixNFTsByOwner(args.owner, ctx),
    getStargazeNFTsByOwner: (_parent, args, ctx) => getStargazeNFTsByOwner(args.owner, ctx),
  },
  Mutation: {
    setProfilePicture: (_parent, args, ctx) => setProfilePicture(args, ctx),
  },
  User: {
    messages: async (parent, args, ctx) => {
      let walletAddress = parent.profile?.address || parent.address;

      // always use like prefix address
      if (walletAddress.startsWith('cosmos')) {
        walletAddress = toLike(walletAddress);
      }

      return getMessages(
        {
          author: walletAddress,
          ...args,
        },
        ctx
      );
    },
  },
};

export { resolvers };
