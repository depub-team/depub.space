import { gql } from 'apollo-server-cloudflare';

const typeDefs = gql`
  type Query {
    messages(previousId: String, limit: Int): [Message]
    messagesByHashTag(tag: String!, previousId: String, limit: Int): [Message]
    messagesByMentioned(mentioned: String!, previousId: String, limit: Int): [Message]
    getMessage(iscnId: String!): Message
    getUser(address: String!, previousId: String, limit: Int): User
    getUserProfile(address: String!): UserProfile
    getDesmosProfile(dtagOrAddress: String!): UserProfile
    getChannels(countryCode: String): Channels
    getStargazeNFTsByOwner(owner: String!): [NFTAsset]
    getOmniflixNFTsByOwner(owner: String!): [NFTAsset]
  }

  type NFTAsset {
    address: String!
    name: String!
    media: String!
    mediaType: String!
    tokenId: String!
  }

  type Mutation {
    setProfilePicture(address: String!, picture: String!): UserProfile
  }

  type Channels {
    list: [List]!
    hashTags: [HashTag]!
  }

  type List {
    name: String!
    hashTag: String!
  }

  type HashTag {
    name: String!
    count: Int!
  }

  type Message {
    id: ID! # ISCN record id
    message: String!
    from: String!
    date: String!
    images: [String]
    profile: UserProfile
  }

  type User {
    address: String!
    profile: UserProfile
    desmosProfile: UserProfile
    messages(previousId: String, limit: Int): [Message]
  }

  type ChainConfig {
    name: String!
    id: ID!
  }

  type ChainLink {
    creationTime: String!
    externalAddress: String!
    chainConfig: ChainConfig
  }

  type UserProfile {
    address: String!
    bio: String
    coverPic: String
    dtag: String
    nickname: String
    profilePic: String
  }
`;

export { typeDefs };
