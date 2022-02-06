import { gql } from 'apollo-server-cloudflare';

const typeDefs = gql`
  type Query {
    messages(previousId: String, limit: Int): [Message]
    messagesByTag(tag: String!, previousId: String, limit: Int): [Message]
    getUser(address: String!, previousId: String, limit: Int): User
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
