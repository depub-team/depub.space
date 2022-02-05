import { gql } from 'apollo-server-cloudflare';

const typeDefs = gql`
  type Query {
    me: User
    messages(tag: String, offset: Int, limit: Int): [Message]
    getUser(address: String!): User
  }

  type Message {
    id: ID! # ISCN record id
    message: String!
    from: String!
    date: String!
    images: [String]
    profile: Profile!
  }

  type User {
    id: ID! # wallet address
    profile: Profile
    messages: [Message]
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
  }
`;

export { typeDefs };
