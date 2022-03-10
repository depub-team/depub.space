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
  query GetUserWithMessagess($dtagOrAddress: String!, $previousId: String, $limit: Int) { 
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
  query MessagesByHashTag($tag: String!, $previousId: String, $limit: Int) {
    messagesByHashTag(tag: $tag, previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
  }
`;

export const GRAPHQL_QUERY_CHANNELS = `
  query GetChannels {
    getChannels {
      list {
        name
        hashTag
      }
      hashTags {
        name
        count
      }
    }
  }
`;
