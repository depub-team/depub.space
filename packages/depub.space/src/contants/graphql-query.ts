export const GRAPHQL_TYPE_PROFILE = `{
  id
  address
  dtag
  nickname
  bio
  coverPic
  creationTime
  profilePic
  chainLinks {
    chainConfig {
      name
    }
    externalAddress
  }
}
`;

export const GRAPHQL_TYPE_MESSAGE = `{
  id
  from
  message
  images
  date
  profile ${GRAPHQL_TYPE_PROFILE}
}`;

export const GRAPHQL_QUERY_MESSAGES_BY_USER = `
  query GetUserWithMessages($dtagOrAddress: String!, $previousId: String, $limit: Int) { 
    getUser(dtagOrAddress: $dtagOrAddress) {
      id
      profile ${GRAPHQL_TYPE_PROFILE}
      messages(previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
    }
  }
`;

export const GRAPHQL_QUERY_GET_USER = `
  query GetUser($dtagOrAddress: String!) {
    getUser(dtagOrAddress: $dtagOrAddress) {
      id
      profile ${GRAPHQL_TYPE_PROFILE}
    }
  }
`;

export const GRAPHQL_QUERY_MESSAGES = `
  query Messages($previousId: String, $limit: Int) {
    messages(previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
  }
`;

export const GRAPHQL_QUERY_GET_MESSAGE = `
  query GetMessage($iscnId: String!) {
    getMessage(iscnId: $iscnId) ${GRAPHQL_TYPE_MESSAGE}
  }
`;

export const GRAPHQL_QUERY_MESSAGES_BY_TAG = `
  query MessagesByTag($tag: String!, $previousId: String, $limit: Int) {
    messagesByTag(tag: $tag, previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
  }
`;
