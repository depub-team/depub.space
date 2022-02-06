export const GRAPHQL_TYPE_PROFILE = `{
  id,
  address,
  dtag,
  nickname,
  bio,
  coverPic,
  creationTime,
  profilePic
}
`;

export const GRAPHQL_TYPE_MESSAGE = `{
  id,
  from,
  message,
  images,
  date,
  profile ${GRAPHQL_TYPE_PROFILE}
}`;

export const GRAPHQL_QUERY_MESSAGES_BY_USER = `
  query GetUserWithMessages($address: String!, $previousId: String, $limit: Int) { 
    getUser(address: $address) {
      id,
      profile ${GRAPHQL_TYPE_PROFILE},
      messages(previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
    }
  }
`;

export const GRAPHQL_QUERY_GET_USER = `
  query GetUser($address: String!) {
    getUser(address: $address) {
      id,
      profile ${GRAPHQL_TYPE_PROFILE},
    }
  }
`;

export const GRAPHQL_QUERY_MESSAGES = `
  query Messages($previousId: String, $limit: Int) {
    messages(previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
  }
`;

export const GRAPHQL_QUERY_MESSAGES_BY_TAG = `
  query MessagesByTag($tag: String!, $previousId: String, $limit: Int) {
    messagesByTag(tag: $tag, previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
  }
`;
