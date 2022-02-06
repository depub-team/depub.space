import { DataSource } from 'apollo-datasource';

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

export class DesmosAPI extends DataSource {
  constructor(private baseURL: string) {
    super();
  }

  public async getProfile(address: string) {
    try {
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
      const profile = data.data.profile[0];

      if (profile) {
        return {
          id: profile.address,
          ...profile,
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    return null;
  }
}
