import { DataSource } from 'apollo-datasource';
import { toCosmos } from '../utils';
import type { DesmosProfile } from '../resolvers/generated_types';

const FETCH_PROFILE_DOCUMENT = `query DesmosProfileLink($address: String) {
  profile(where: { chain_links: { external_address: { _eq: $address } } }) {
    address
    bio
    dtag
    nickname
    profilePic: profile_pic
    coverPic: cover_pic
    chainLinks: chain_links {
      creationTime: creation_time
      externalAddress: external_address
      chainConfig: chain_config {
        name
        id
      }
    }
    applicationLinks: application_links(
      where: { state: { _eq: "APPLICATION_LINK_STATE_VERIFICATION_SUCCESS" } }
    ) {
      username
      creationTime: creation_time
      application
    }
    creationTime: creation_time
  }
}`;

const FETCH_PROFILE_DOCUMENT_BY_DTAG = `query DesmosProfileLink($dtag: String) {
  profile(where: { dtag: { _eq: $dtag } }) {
    address
    bio
    dtag
    nickname
    profilePic: profile_pic
    coverPic: cover_pic
    chainLinks: chain_links {
      creationTime: creation_time
      externalAddress: external_address
      chainConfig: chain_config {
        name
        id
      }
    }
    applicationLinks: application_links(
      where: { state: { _eq: "APPLICATION_LINK_STATE_VERIFICATION_SUCCESS" } }
    ) {
      username
      creationTime: creation_time
      application
    }
    creationTime: creation_time
  }
}`;

export const getLikecoinAddressByProfile = (profile: DesmosProfile): string | undefined => {
  const profileChainLink = profile.chainLinks?.find(cl => cl?.chainConfig?.name === 'likecoin');
  const likecoinAddress = profileChainLink?.externalAddress;

  return likecoinAddress;
};

export class DesmosAPI extends DataSource {
  constructor(private baseURL: string) {
    super();
  }

  private async getProfileWithLikecoinAddress(address: string): Promise<DesmosProfile | null> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: FETCH_PROFILE_DOCUMENT,
        variables: {
          address,
        },
      }),
    });
    const data = await response.json<any>();

    if (data.data.profile[0]) {
      return data.data.profile[0] as DesmosProfile;
    }

    return null;
  }

  public async getProfile(address: string) {
    const isLikePrefix = address.startsWith('like');
    const profile = await this.getProfileWithLikecoinAddress(address);

    if (profile) {
      return { ...profile, profilePicProvider: 'desmos' };
    }

    // retry with cosmos prefixed address if not found
    if (!isLikePrefix) {
      const cosmosPrefixedAddress = toCosmos(address);

      return this.getProfileWithLikecoinAddress(cosmosPrefixedAddress);
    }

    return null;
  }

  public async getProfileByDtag(dtag: string) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: FETCH_PROFILE_DOCUMENT_BY_DTAG,
        variables: {
          dtag,
        },
      }),
    });
    const data = await response.json<any>();
    const profile = data.data.profile[0];

    if (profile) {
      return { ...profile, profilePicProvider: 'desmos' };
    }

    return null;
  }
}
