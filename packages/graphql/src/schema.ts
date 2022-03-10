import { gql } from 'apollo-server-cloudflare';

const typeDefs = gql`
  type Query {
    messages(previousId: String, limit: Int): [Message]
    messagesByChannel(tag: String!, previousId: String, limit: Int): [Message]
    messagesByMentioned(mentioned: String!, previousId: String, limit: Int): [Message]
    getMessage(iscnId: String!): Message
    getUser(dtagOrAddress: String!, previousId: String, limit: Int): User
    getUserProfile(dtagOrAddress: String!): Profile
    getChannels: Channels
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
    profile: Profile
  }

  type User {
    id: ID! # wallet address
    profile: Profile
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

  type Profile {
    id: ID! # Desmos address
    address: String!
    bio: String
    coverPic: String
    creationTime: String! # ISO timestamp
    dtag: String!
    nickname: String!
    profilePic: String
    chainLinks: [ChainLink]
  }
`;

export { typeDefs };
