import { Resolvers } from './generated_types';
import { getChannels } from './get-channels.resolver';
import { getDesmosProfileResolver } from './get-desmos-profile.resolver';
import { getUserProfileResolver } from './get-user-profile.resolver';
import { getUser } from './get-user.resolver';
import { getMessages } from './get-messages.resolver';
import { getMessage } from './get-message.resolver';
import { setProfilePicture } from './set-profile-picture.resolver';
import { getStargazeNFTsByOwner } from './get-stargaze-nfts-by-owner';
import { getOmniflixNFTsByOwner } from './get-omniflix-nfts-by-owner';
import { toLike } from '../utils';

const resolvers: Resolvers = {
  Query: {
    getUser: (_parent, args, ctx) => getUser(args.dtagOrAddress, ctx),
    messages: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByHashTag: async (_parent, args, ctx) => getMessages(args, ctx),
    messagesByMentioned: async (_parent, args, ctx) => getMessages(args, ctx),
    getDesmosProfile: (_parent, args, ctx) => getDesmosProfileResolver(args, ctx),
    getUserProfile: (_parent, args, ctx) => getUserProfileResolver(args, ctx),
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
