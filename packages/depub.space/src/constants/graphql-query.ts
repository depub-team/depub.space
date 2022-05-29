export const GRAPHQL_TYPE_PROFILE = `{
  address
  dtag
  nickname
  bio
  coverPic
  profilePic
  profilePicProvider
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
  query GetUser($dtagOrAddress: String!, $previousId: String, $limit: Int) { 
    getUser(dtagOrAddress: $dtagOrAddress) {
      profile ${GRAPHQL_TYPE_PROFILE}
      messages(previousId: $previousId, limit: $limit) ${GRAPHQL_TYPE_MESSAGE}
    }
  }
`;

export const GRAPHQL_QUERY_STARGAZE_NFT_BY_USER = `
  query GetStargazeNFTsByOwner($owner: String!) {
    getStargazeNFTsByOwner(owner: $owner) {
      address
      media
      mediaType
      tokenId
    }
  }
`;

export const GRAPHQL_QUERY_OMNIFLIX_NFT_BY_USER = `
  query GetOmniflixNFTsByOwner($owner: String!) {
    getOmniflixNFTsByOwner(owner: $owner) {
      address
      media
      mediaType
      tokenId
    }
  }
`;

export const GRAPHQL_QUERY_GET_USER = `
  query GetUser($dtagOrAddress: String!) {
    getUser(dtagOrAddress: $dtagOrAddress) {
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
  query GetChannels($countryCode: String) {
    getChannels(countryCode: $countryCode) {
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

export const GRAPHQL_QUERY_GET_DESMOS_PROFILE = `
  query GetDesmosProfile($dtagOrAddress: String!) {
    getDesmosProfile(dtagOrAddress: $dtagOrAddress) ${GRAPHQL_TYPE_PROFILE}
  }
`;
